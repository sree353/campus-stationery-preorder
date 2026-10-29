const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}/api`;

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('====================================================');
  console.log('🧪 RUNNING FULL INTEGRATION TEST SUITE FOR BIT PLATFORM');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    const health = await request('/health');
    assert(health.status === 200 && health.body.status === 'online', 'Server Health Check API');

    // 2. Authentication: Student Login
    const studentLogin = await request('/auth/login', 'POST', {
      email: 'student@bit.edu',
      password: 'student123',
    });
    assert(studentLogin.status === 200 && studentLogin.body.token, 'Student Authentication');
    const studentToken = studentLogin.body.token;

    // 3. Authentication: Staff Login
    const staffLogin = await request('/auth/login', 'POST', {
      email: 'staff@bit.edu',
      password: 'staff123',
    });
    assert(staffLogin.status === 200 && staffLogin.body.user.role === 'staff', 'Store Staff Authentication');
    const staffToken = staffLogin.body.token;

    // 4. Authentication: Admin Login
    const adminLogin = await request('/auth/login', 'POST', {
      email: 'admin@bit.edu',
      password: 'admin123',
    });
    assert(adminLogin.status === 200 && adminLogin.body.user.role === 'admin', 'Admin Authentication');
    const adminToken = adminLogin.body.token;

    // 5. Products Catalog Browsing & Filtering
    const productsRes = await request('/products?category=Notebooks%20%26%20Registers');
    assert(productsRes.status === 200 && productsRes.body.products.length > 0, 'Products Search & Filtering by Category');
    const targetProduct = productsRes.body.products[0];
    const initialStock = targetProduct.stockQuantity;
    console.log(`   [Info]: Selected test item: "${targetProduct.name}" (Code: ${targetProduct.itemCode}) | Initial Stock: ${initialStock}`);

    // 6. Over-order prevention check: Prevent ordering more than available stock
    const overOrderRes = await request(
      '/orders',
      'POST',
      {
        items: [{ productId: targetProduct._id, quantity: initialStock + 50 }],
        pickupDate: new Date(Date.now() + 86400000).toISOString(),
        pickupTimeSlot: 'Lunch Break (12:45 PM - 01:45 PM)',
      },
      studentToken
    );
    assert(
      overOrderRes.status === 400 && overOrderRes.body.message.includes('Cannot order'),
      'Prevent Ordering More Than Available Stock Check',
      JSON.stringify(overOrderRes.body)
    );

    // 7. Place Valid Pre-Order & Verify Stock Deduction
    const orderRes = await request(
      '/orders',
      'POST',
      {
        items: [{ productId: targetProduct._id, quantity: 2 }],
        pickupDate: new Date(Date.now() + 86400000).toISOString(),
        pickupTimeSlot: 'Morning Slot (08:30 AM - 09:15 AM)',
        studentNotes: 'Hold for morning test lab',
      },
      studentToken
    );
    assert(orderRes.status === 201 && orderRes.body.order.orderNumber, 'Student Pre-Order Creation');
    const createdOrder = orderRes.body.order;

    // Verify stock deduction on product
    const updatedProdRes = await request(`/products/${targetProduct._id}`);
    const newStock = updatedProdRes.body.product.stockQuantity;
    assert(newStock === initialStock - 2, 'Automatic Real-Time Stock Deduction upon Order Confirmation', `Expected: ${initialStock - 2}, Got: ${newStock}`);

    // 8. Student Order History
    const myOrdersRes = await request('/orders/my-orders', 'GET', null, studentToken);
    const orderFound = myOrdersRes.body.orders.some((o) => o._id === createdOrder._id);
    assert(myOrdersRes.status === 200 && orderFound, 'Student Order History & Tracking');

    // 9. Staff Orders Queue & Status Transition
    const staffOrders = await request('/orders', 'GET', null, staffToken);
    assert(staffOrders.status === 200 && staffOrders.body.orders.length > 0, 'Store Staff Orders Queue Retrieval');

    const updateStatusRes = await request(
      `/orders/${createdOrder._id}/status`,
      'PUT',
      {
        status: 'READY_FOR_PICKUP',
        staffNotes: 'Item packaged in counter slot C-2',
      },
      staffToken
    );
    assert(updateStatusRes.status === 200 && updateStatusRes.body.order.status === 'READY_FOR_PICKUP', 'Staff Status Transition (Ready for Pickup)');

    // 10. Admin Dashboard & Analytics Metrics
    const analyticsRes = await request('/analytics/dashboard', 'GET', null, adminToken);
    assert(
      analyticsRes.status === 200 && analyticsRes.body.data.counts.totalProducts > 0,
      'Admin Analytics & Dashboard Metrics Retrieval'
    );

    // 11. Staff/Admin Quick Restock
    const restockRes = await request(
      '/inventory/restock',
      'POST',
      {
        productId: targetProduct._id,
        addedQuantity: 10,
        note: 'Test restock delivery',
      },
      staffToken
    );
    assert(
      restockRes.status === 200 && restockRes.body.product.stockQuantity === newStock + 10,
      'Inventory Quick Restock & Automatic Status Recomputation'
    );

    // 12. Student Cancel Pending Order Stock Restoration Check
    // Create another pending order to test student cancellation & stock restoration
    const testOrder2 = await request(
      '/orders',
      'POST',
      {
        items: [{ productId: targetProduct._id, quantity: 1 }],
        pickupDate: new Date(Date.now() + 86400000).toISOString(),
        pickupTimeSlot: 'Lunch Break (12:45 PM - 01:45 PM)',
      },
      studentToken
    );
    const order2Id = testOrder2.body.order._id;
    const stockAfterOrder2 = (await request(`/products/${targetProduct._id}`)).body.product.stockQuantity;

    const cancelRes = await request(`/orders/${order2Id}/cancel`, 'PUT', null, studentToken);
    const stockAfterCancel = (await request(`/products/${targetProduct._id}`)).body.product.stockQuantity;
    assert(
      cancelRes.status === 200 && stockAfterCancel === stockAfterOrder2 + 1,
      'Order Cancellation Automatic Stock Restoration'
    );

    // 15. Xerox Settings Retrieval
    const xeroxSettingsRes = await request('/xerox/settings');
    assert(
      xeroxSettingsRes.status === 200 && xeroxSettingsRes.body.settings.bwPricePerPage !== undefined,
      'Xerox Pricing Settings Retrieval'
    );

    // 16. Admin Update Xerox Pricing Settings
    const updateSettingsRes = await request(
      '/xerox/settings',
      'PUT',
      { bwPricePerPage: 2.5, colorPricePerPage: 12.0 },
      adminToken
    );
    assert(
      updateSettingsRes.status === 200 && updateSettingsRes.body.settings.bwPricePerPage === 2.5,
      'Admin Configure Xerox B&W and Colour Pricing'
    );

    // 17. Student My Xerox Orders Retrieval
    const myXeroxRes = await request('/xerox/my-orders', 'GET', null, studentToken);
    assert(
      myXeroxRes.status === 200 && Array.isArray(myXeroxRes.body.orders) && myXeroxRes.body.orders.length > 0,
      'Student My Xerox Orders Retrieval'
    );
    const sampleXeroxOrder = myXeroxRes.body.orders[0];

    // 18. Store Staff Xerox Orders Queue Retrieval
    const staffXeroxRes = await request('/xerox', 'GET', null, staffToken);
    assert(
      staffXeroxRes.status === 200 && staffXeroxRes.body.orders.length >= 2,
      'Store Staff Xerox Requests Queue Retrieval'
    );

    // 19. Staff Status Transition (Xerox Order Status Update)
    const xeroxStatusRes = await request(
      `/xerox/${sampleXeroxOrder._id}/status`,
      'PUT',
      { status: 'READY_FOR_PICKUP', staffNotes: 'Printed and placed on pickup desk' },
      staffToken
    );
    assert(
      xeroxStatusRes.status === 200 && xeroxStatusRes.body.order.status === 'READY_FOR_PICKUP',
      'Staff Xerox Order Status Transition (Ready for Pickup)'
    );

    // 20. Staff Mark Payment as Paid
    const xeroxPayRes = await request(
      `/xerox/${sampleXeroxOrder._id}/payment`,
      'PUT',
      { paymentStatus: 'PAID', paymentMethod: 'Counter UPI Verified' },
      staffToken
    );
    assert(
      xeroxPayRes.status === 200 && xeroxPayRes.body.order.paymentStatus === 'PAID',
      'Staff Mark Xerox Order Payment as Paid'
    );

    // 21. Document Security: Prevent Unauthorized Student Access
    const priyaLogin = await request('/auth/login', 'POST', {
      email: 'priya@bit.edu',
      password: 'student123',
    });
    const priyaToken = priyaLogin.body.token;
    const unauthorizedDocRes = await request(`/xerox/document/${sampleXeroxOrder._id}`, 'GET', null, priyaToken);
    assert(
      unauthorizedDocRes.status === 403,
      'Document Security: Unauthorized Student Access Prevention Check'
    );

    // 22. Document Security: Authorized Staff Access
    const authorizedDocRes = await request(`/xerox/document/${sampleXeroxOrder._id}`, 'GET', null, staffToken);
    assert(
      authorizedDocRes.status === 200,
      'Document Security: Authorized Staff Secure Document Access Check'
    );

    console.log('\n====================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test Suite Fatal Error:', error);
    process.exit(1);
  }
};

runTests();
