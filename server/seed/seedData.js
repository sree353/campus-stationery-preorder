require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const XeroxOrder = require('../models/XeroxOrder');
const XeroxSetting = require('../models/XeroxSetting');
const Notification = require('../models/Notification');
const InventoryLog = require('../models/InventoryLog');
const path = require('path');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bit_stationery_db');
    console.log('[Seed]: Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await XeroxOrder.deleteMany({});
    await XeroxSetting.deleteMany({});
    await Notification.deleteMany({});
    await InventoryLog.deleteMany({});
    console.log('[Seed]: Cleared existing database records.');

    // 1. Seed Users
    const users = await User.create([
      {
        name: 'Aarav Sharma',
        email: 'student@bit.edu',
        password: 'student123',
        role: 'student',
        rollNumber: '22BITCSE042',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        phone: '+91 98765 43210',
      },
      {
        name: 'Priya Sundaram',
        email: 'priya@bit.edu',
        password: 'student123',
        role: 'student',
        rollNumber: '23BITECE118',
        department: 'Electronics & Communication',
        year: '2nd Year',
        phone: '+91 98451 23456',
      },
      {
        name: 'Ramesh Kannan',
        email: 'staff@bit.edu',
        password: 'staff123',
        role: 'staff',
        department: 'Central Campus Stationery Store',
        year: 'Faculty/Staff',
        phone: '+91 94432 10987',
      },
      {
        name: 'Dr. K. Balasubramanian',
        email: 'admin@bit.edu',
        password: 'admin123',
        role: 'admin',
        department: 'Campus Administration & Stores',
        year: 'Admin',
        phone: '+91 98940 98765',
      },
    ]);

    const [studentAarav, studentPriya, staffRamesh, adminBala] = users;
    console.log(`[Seed]: Created ${users.length} default users (Student, Staff, Admin).`);

    // 2. Seed Products
    const sampleProducts = [
      {
        name: 'BIT Official Lab Record Notebook',
        itemCode: 'BIT-NOTE-01',
        category: 'Notebooks & Registers',
        brand: 'BIT Press',
        unit: 'Book (160 Pages)',
        price: 85,
        stockQuantity: 45,
        minStockThreshold: 15,
        description: 'Hardbound official college laboratory observation & record notebook with ruled and alternate graph pages.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Pages', value: '160 Pages' },
          { key: 'Binding', value: 'Hardbound Rexine' },
          { key: 'Format', value: 'Rule + Graph' },
        ],
      },
      {
        name: 'BIT Spiral Project Rough Pad (A4)',
        itemCode: 'BIT-NOTE-02',
        category: 'Notebooks & Registers',
        brand: 'Classmate',
        unit: 'Pad (200 Pages)',
        price: 110,
        stockQuantity: 28,
        minStockThreshold: 10,
        description: 'High-grade 70 GSM micro-perforated spiral notebook ideal for classroom lecture notes and rough work.',
        image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Size', value: 'A4 (210 x 297 mm)' },
          { key: 'Paper', value: '70 GSM Bright White' },
        ],
      },
      {
        name: 'Casio fx-991CW Scientific Calculator',
        itemCode: 'BIT-TECH-01',
        category: 'Calculators & Tech',
        brand: 'Casio',
        unit: 'Piece',
        price: 1495,
        stockQuantity: 14,
        minStockThreshold: 5,
        description: 'Latest approved non-programmable scientific calculator with 540+ functions, natural textbook display, and QR code visualization.',
        image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Functions', value: '540+ Functions' },
          { key: 'Warranty', value: '3 Years Casio India' },
          { key: 'Approved For', value: 'University Semester Exams' },
        ],
      },
      {
        name: 'Engineering Mini Drafter with Carry Bag',
        itemCode: 'BIT-ENG-01',
        category: 'Drawing & Engineering',
        brand: 'Omega Drafters',
        unit: 'Set',
        price: 450,
        stockQuantity: 6, // LOW STOCK
        minStockThreshold: 10,
        description: 'Precision engineering graphics mini drafter equipped with stainless steel arms, unbreakable scales, clamp, and canvas cover.',
        image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Material', value: 'Steel & Acrylic' },
          { key: 'Includes', value: 'Protective Pouch' },
        ],
      },
      {
        name: 'Imperial A2 Drawing Sheets (Pack of 5)',
        itemCode: 'BIT-ENG-02',
        category: 'Drawing & Engineering',
        brand: 'Campap',
        unit: 'Pack of 5 Sheets',
        price: 65,
        stockQuantity: 4, // LOW STOCK
        minStockThreshold: 12,
        description: '150 GSM heavyweight ivory cartridge sheets recommended for Engineering Graphics & CAD manual drafting.',
        image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Sheet Size', value: 'A2 (420 x 594 mm)' },
          { key: 'GSM', value: '150 GSM' },
        ],
      },
      {
        name: 'Camlin Deluxe Mathematical Instrument Box',
        itemCode: 'BIT-ENG-03',
        category: 'Drawing & Engineering',
        brand: 'Camlin',
        unit: 'Box',
        price: 180,
        stockQuantity: 0, // OUT OF STOCK
        minStockThreshold: 8,
        description: 'Complete geometry box with die-cast compass, divider, 15cm ruler, 45 & 60 degree set squares, and protractor.',
        image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Casing', value: 'Tin Box' },
          { key: 'Accuracy', value: 'High Precision' },
        ],
      },
      {
        name: 'Pilot V7 Hi-Tecpoint 0.7mm Pen (Blue)',
        itemCode: 'BIT-PEN-01',
        category: 'Pens & Writing',
        brand: 'Pilot',
        unit: 'Piece',
        price: 70,
        stockQuantity: 80,
        minStockThreshold: 20,
        description: 'Pure liquid ink roller ball pen with multi-channel ink flow regulator. Smooth writing for tests and records.',
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Tip Size', value: '0.7 mm Fine' },
          { key: 'Ink Color', value: 'Royal Blue' },
        ],
      },
      {
        name: 'Pilot V7 Hi-Tecpoint 0.7mm Pen (Black)',
        itemCode: 'BIT-PEN-02',
        category: 'Pens & Writing',
        brand: 'Pilot',
        unit: 'Piece',
        price: 70,
        stockQuantity: 75,
        minStockThreshold: 20,
        description: 'Pure liquid ink black roller ball pen ideal for project titles, sketches, and engineering drawings.',
        image: 'https://images.unsplash.com/photo-1585336261026-77894a485542?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Tip Size', value: '0.7 mm Fine' },
          { key: 'Ink Color', value: 'Jet Black' },
        ],
      },
      {
        name: 'Reynolds 045 Carbure Ball Pens (Pack of 5)',
        itemCode: 'BIT-PEN-03',
        category: 'Pens & Writing',
        brand: 'Reynolds',
        unit: 'Pack of 5',
        price: 50,
        stockQuantity: 52,
        minStockThreshold: 15,
        description: 'Laser tip precision smooth writing ball pens. Consistent flow for rapid semester examination writing.',
        image: 'https://images.unsplash.com/photo-1569683795645-b62e50fbf103?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Pack Size', value: '5 Pens' },
          { key: 'Ink Type', value: 'Non-Smudge Blue' },
        ],
      },
      {
        name: 'BIT Official Final Project Report Hardcover File',
        itemCode: 'BIT-FILE-01',
        category: 'Files & Folders',
        brand: 'BIT Bindery',
        unit: 'Piece',
        price: 150,
        stockQuantity: 22,
        minStockThreshold: 10,
        description: 'Black Rexine hardcover binding folder with golden embossed BIT crest and department standard lettering.',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Embossing', value: 'Golden Foil College Crest' },
          { key: 'Capacity', value: 'Up to 250 Sheets' },
        ],
      },
      {
        name: 'Clear Display Book Folder (40 Pockets)',
        itemCode: 'BIT-FILE-02',
        category: 'Files & Folders',
        brand: 'Solo',
        unit: 'Piece',
        price: 135,
        stockQuantity: 18,
        minStockThreshold: 8,
        description: 'Anti-static clear polypropylene pockets for semester project presentation and certificate storage.',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Pockets', value: '40 Transparent Sheets' },
          { key: 'Size', value: 'A4' },
        ],
      },
      {
        name: 'JK Copier A4 Paper 75 GSM (500 Sheets Ream)',
        itemCode: 'BIT-PAP-01',
        category: 'Lab & Examination Supplies',
        brand: 'JK Paper',
        unit: 'Ream (500 Sheets)',
        price: 320,
        stockQuantity: 3, // LOW STOCK
        minStockThreshold: 15,
        description: 'High brightness 75 GSM multipurpose A4 paper for assignments, lab printouts, and thesis printing.',
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Sheet Count', value: '500 Sheets' },
          { key: 'Brightness', value: '98%' },
        ],
      },
      {
        name: 'Engineering Graph Sheet Pad (100 Sheets)',
        itemCode: 'BIT-PAP-02',
        category: 'Lab & Examination Supplies',
        brand: 'Bapu',
        unit: 'Pad',
        price: 60,
        stockQuantity: 35,
        minStockThreshold: 10,
        description: 'Millimeter calibrated green line graph sheets for Physics, Chemistry, and Electrical labs.',
        image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Grid', value: '1 mm & 1 cm calibration' },
          { key: 'Sheets', value: '100 Sheets' },
        ],
      },
      {
        name: 'Kangaro HD-10 Heavy Duty Desk Stapler',
        itemCode: 'BIT-ACC-01',
        category: 'Adhesives & Tools',
        brand: 'Kangaro',
        unit: 'Piece',
        price: 95,
        stockQuantity: 19,
        minStockThreshold: 5,
        description: 'All-metal construction stapler with built-in staple remover and reload indicator. Holds No. 10 pins.',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Capacity', value: '20 Sheets 75 GSM' },
          { key: 'Staple Pin', value: 'No. 10' },
        ],
      },
      {
        name: '3M Post-it Sticky Notes (Yellow 3x3)',
        itemCode: 'BIT-ACC-02',
        category: 'Adhesives & Tools',
        brand: '3M Post-it',
        unit: 'Pad (100 Sheets)',
        price: 55,
        stockQuantity: 40,
        minStockThreshold: 10,
        description: 'Self-adhesive repositionable memo notes for textbook bookmarks and quick task reminders.',
        image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60',
        specifications: [
          { key: 'Dimensions', value: '76 mm x 76 mm (3x3 in)' },
          { key: 'Color', value: 'Canary Yellow' },
        ],
      },
    ];

    const createdProducts = [];
    for (const prodData of sampleProducts) {
      const status = Product.computeStatus(prodData.stockQuantity, prodData.minStockThreshold);
      const prod = await Product.create({
        ...prodData,
        status,
      });
      createdProducts.push(prod);

      // Inventory initial log
      await InventoryLog.create({
        product: prod._id,
        action: 'INITIAL_SEED',
        previousStock: 0,
        newStock: prod.stockQuantity,
        quantityChanged: prod.stockQuantity,
        performedBy: adminBala._id,
        note: 'Initial catalog stock ingestion',
      });
    }

    console.log(`[Seed]: Created ${createdProducts.length} stationery items with stock thresholds.`);

    // 3. Seed Sample Orders
    const labRecord = createdProducts.find((p) => p.itemCode === 'BIT-NOTE-01');
    const pilotBlue = createdProducts.find((p) => p.itemCode === 'BIT-PEN-01');
    const casioCalc = createdProducts.find((p) => p.itemCode === 'BIT-TECH-01');
    const drawingSheet = createdProducts.find((p) => p.itemCode === 'BIT-ENG-02');

    // Tomorrow's date for pickup
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(13, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(16, 30, 0, 0);

    const sampleOrders = [
      {
        orderNumber: 'BIT-ORD-260101-1042',
        student: studentAarav._id,
        studentDetails: {
          name: studentAarav.name,
          email: studentAarav.email,
          rollNumber: studentAarav.rollNumber,
          department: studentAarav.department,
          phone: studentAarav.phone,
        },
        items: [
          {
            product: labRecord._id,
            name: labRecord.name,
            itemCode: labRecord.itemCode,
            price: labRecord.price,
            quantity: 2,
            subtotal: labRecord.price * 2,
            image: labRecord.image,
          },
          {
            product: pilotBlue._id,
            name: pilotBlue.name,
            itemCode: pilotBlue.itemCode,
            price: pilotBlue.price,
            quantity: 3,
            subtotal: pilotBlue.price * 3,
            image: pilotBlue.image,
          },
        ],
        totalAmount: labRecord.price * 2 + pilotBlue.price * 3,
        totalItems: 5,
        status: 'READY_FOR_PICKUP',
        pickupDate: tomorrow,
        pickupTimeSlot: 'Lunch Break (12:45 PM - 01:45 PM)',
        paymentStatus: 'UNPAID',
        studentNotes: 'Please pack in an eco bag if available.',
        staffNotes: 'Verified and packed in counter drawer slot A-4.',
        processedBy: staffRamesh._id,
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date(Date.now() - 3600000 * 5),
            note: 'Order submitted by student',
            updatedBy: studentAarav._id,
          },
          {
            status: 'CONFIRMED',
            timestamp: new Date(Date.now() - 3600000 * 3),
            note: 'Order confirmed by store desk',
            updatedBy: staffRamesh._id,
          },
          {
            status: 'READY_FOR_PICKUP',
            timestamp: new Date(Date.now() - 3600000 * 1),
            note: 'Packed and placed in pickup bay',
            updatedBy: staffRamesh._id,
          },
        ],
      },
      {
        orderNumber: 'BIT-ORD-260102-3391',
        student: studentPriya._id,
        studentDetails: {
          name: studentPriya.name,
          email: studentPriya.email,
          rollNumber: studentPriya.rollNumber,
          department: studentPriya.department,
          phone: studentPriya.phone,
        },
        items: [
          {
            product: casioCalc._id,
            name: casioCalc.name,
            itemCode: casioCalc.itemCode,
            price: casioCalc.price,
            quantity: 1,
            subtotal: casioCalc.price,
            image: casioCalc.image,
          },
          {
            product: drawingSheet._id,
            name: drawingSheet.name,
            itemCode: drawingSheet.itemCode,
            price: drawingSheet.price,
            quantity: 1,
            subtotal: drawingSheet.price,
            image: drawingSheet.image,
          },
        ],
        totalAmount: casioCalc.price + drawingSheet.price,
        totalItems: 2,
        status: 'PENDING',
        pickupDate: dayAfter,
        pickupTimeSlot: 'Evening Post-Class (04:30 PM - 05:45 PM)',
        paymentStatus: 'UNPAID',
        studentNotes: 'Needed for semester lab exam preparation.',
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date(),
            note: 'Pre-order placed by student',
            updatedBy: studentPriya._id,
          },
        ],
      },
    ];

    const createdOrders = await Order.create(sampleOrders);
    console.log(`[Seed]: Created ${createdOrders.length} initial pre-orders.`);

    // 3b. Seed Xerox Settings
    const xeroxSettings = await XeroxSetting.create({
      bwPricePerPage: 2.0,
      colorPricePerPage: 10.0,
      doubleSidedDiscountPerPage: 0.5,
      cornerStapleCharge: 2.0,
      spiralBindingCharge: 30.0,
      softBindingCharge: 50.0,
      updatedBy: adminBala._id,
    });
    console.log('[Seed]: Created default Xerox printing configuration.');

    // 3c. Seed Sample Xerox Pre-Orders
    const uploadDir = path.join(__dirname, '../uploads/xerox');
    const sampleXeroxOrders = [
      {
        orderNumber: 'BIT-XRX-261021-1001',
        student: studentAarav._id,
        studentDetails: {
          name: studentAarav.name,
          email: studentAarav.email,
          rollNumber: studentAarav.rollNumber,
          department: studentAarav.department,
          phone: studentAarav.phone,
          year: studentAarav.year,
        },
        file: {
          originalName: 'BIT_CSE_WebTech_Lab_Manual.pdf',
          fileName: 'BIT_CSE_WebTech_Lab_Manual.pdf',
          filePath: path.join(uploadDir, 'BIT_CSE_WebTech_Lab_Manual.pdf'),
          fileSize: 45000,
          mimeType: 'application/pdf',
          detectedPages: 6,
        },
        printConfig: {
          pageRangeType: 'ALL',
          calculatedPages: 6,
          copies: 2,
          colorMode: 'BW',
          printSides: 'DOUBLE',
          paperSize: 'A4',
          binding: 'CORNER_STAPLE',
          ratePerPage: 1.5,
          bindingCharge: 2.0,
        },
        totalAmount: 22.0, // (6 * 1.5 + 2) * 2 = 22
        pickupDate: new Date(Date.now() + 86400000),
        pickupTimeSlot: 'Lunch Break (12:45 PM - 01:45 PM)',
        paymentMethod: 'Pay at Store Counter upon Pickup (Cash / Campus UPI)',
        paymentStatus: 'PENDING',
        status: 'READY_FOR_PICKUP',
        studentNotes: 'Please ensure crisp text for code snippets.',
        staffNotes: 'Printed and stapled on top-left corner.',
        processedBy: staffRamesh._id,
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date(Date.now() - 3600000),
            note: 'Order submitted by student',
            updatedBy: studentAarav._id,
          },
          {
            status: 'ACCEPTED',
            timestamp: new Date(Date.now() - 2500000),
            note: 'Accepted by Xerox operator',
            updatedBy: staffRamesh._id,
          },
          {
            status: 'PRINTING',
            timestamp: new Date(Date.now() - 1800000),
            note: 'Sent to Canon Digital Duplicator',
            updatedBy: staffRamesh._id,
          },
          {
            status: 'READY_FOR_PICKUP',
            timestamp: new Date(Date.now() - 900000),
            note: 'Printed, corner stapled, placed in Tray #3',
            updatedBy: staffRamesh._id,
          },
        ],
      },
      {
        orderNumber: 'BIT-XRX-261021-1002',
        student: studentPriya._id,
        studentDetails: {
          name: studentPriya.name,
          email: studentPriya.email,
          rollNumber: studentPriya.rollNumber,
          department: studentPriya.department,
          phone: studentPriya.phone,
          year: studentPriya.year,
        },
        file: {
          originalName: 'BIT_Mini_Project_Report_Draft.pdf',
          fileName: 'BIT_Mini_Project_Report_Draft.pdf',
          filePath: path.join(uploadDir, 'BIT_Mini_Project_Report_Draft.pdf'),
          fileSize: 92000,
          mimeType: 'application/pdf',
          detectedPages: 12,
        },
        printConfig: {
          pageRangeType: 'CUSTOM',
          customPageRange: '1-10',
          calculatedPages: 10,
          copies: 1,
          colorMode: 'COLOUR',
          printSides: 'SINGLE',
          paperSize: 'A4',
          binding: 'SPIRAL_BINDING',
          ratePerPage: 10.0,
          bindingCharge: 30.0,
        },
        totalAmount: 130.0, // (10 * 10 + 30) * 1 = 130
        pickupDate: new Date(Date.now() + 86400000 * 2),
        pickupTimeSlot: 'Afternoon Slot (03:15 PM - 03:45 PM)',
        paymentMethod: 'Pay at Store Counter upon Pickup (Cash / Campus UPI)',
        paymentStatus: 'PENDING',
        status: 'PENDING',
        studentNotes: 'Spiral binding with blue transparent plastic cover sheet.',
        staffNotes: '',
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date(),
            note: 'Order submitted by student',
            updatedBy: studentPriya._id,
          },
        ],
      },
    ];

    const createdXeroxOrders = await XeroxOrder.create(sampleXeroxOrders);
    console.log(`[Seed]: Created ${createdXeroxOrders.length} initial Xerox orders.`);

    // 4. Seed Notifications
    await Notification.create([
      {
        targetRole: 'staff',
        title: 'Low Stock Alert',
        message: 'Engineering Mini Drafter (BIT-ENG-01) has only 6 units remaining (Threshold: 10).',
        type: 'LOW_STOCK',
        relatedProduct: createdProducts.find((p) => p.itemCode === 'BIT-ENG-01')._id,
      },
      {
        targetRole: 'staff',
        title: 'Item Out of Stock',
        message: 'Camlin Deluxe Mathematical Instrument Box (BIT-ENG-03) has reached 0 units.',
        type: 'OUT_OF_STOCK',
        relatedProduct: createdProducts.find((p) => p.itemCode === 'BIT-ENG-03')._id,
      },
      {
        recipient: studentAarav._id,
        targetRole: 'student',
        title: 'Order Ready for Pickup!',
        message: `Your pre-order #${sampleOrders[0].orderNumber} is packed and ready! Collect during Lunch Break (12:45 PM - 01:45 PM).`,
        type: 'ORDER_UPDATE',
        relatedOrder: createdOrders[0]._id,
      },
      {
        recipient: studentAarav._id,
        targetRole: 'student',
        title: 'Xerox Documents Ready for Pickup!',
        message: `Your Xerox order #${sampleXeroxOrders[0].orderNumber} (${sampleXeroxOrders[0].file.originalName}) has been printed and is ready at Store Desk #02. (Pay ₹${sampleXeroxOrders[0].totalAmount} at counter).`,
        type: 'ORDER_UPDATE',
      },
      {
        targetRole: 'staff',
        title: 'New Xerox Print Request',
        message: `New Xerox request #${sampleXeroxOrders[1].orderNumber} submitted by Priya Sundaram (10 pages COLOUR, Spiral Binding).`,
        type: 'ORDER_UPDATE',
      },
      {
        targetRole: 'all',
        title: 'Welcome to Smart BIT Stationery',
        message: 'Pre-order your lab records, calculators, drawing sheets and stationery to skip the long counter queues during rush hours!',
        type: 'SYSTEM',
      },
    ]);

    console.log('[Seed]: Seeded notifications.');
    console.log('----------------------------------------------------');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('Credentials to test:');
    console.log('Student: student@bit.edu / student123 (or priya@bit.edu)');
    console.log('Store Staff: staff@bit.edu / staff123');
    console.log('Admin: admin@bit.edu / admin123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDB();
