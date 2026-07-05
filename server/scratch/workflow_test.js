import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('🚀 Starting Automated Integration Tests for Gajanana Royal Hampers...');

  const timestamp = Date.now();
  const testEmail = `testuser_${timestamp}@royalhampers.com`;
  const testPhone = '9876543210';
  const testPassword = 'SecurePassword123';
  const testName = 'Vishal Handigund';

  let customerToken = '';
  let adminToken = '';
  let deliveryToken = '';
  let createdOrderId = '';
  let targetOTP = '';
  let rajuStaffId = '';

  // 1. Register a new user
  try {
    console.log(`\nStep 1: Registering new customer (${testEmail})...`);
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
        phone: testPhone
      })
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.message || 'Registration failed');
    customerToken = regData.token;
    console.log(`✅ Customer registered successfully! ID: ${regData._id}`);
  } catch (err) {
    console.error('❌ Step 1 Failed:', err.message);
    process.exit(1);
  }

  // 2. Authenticate the registered user
  try {
    console.log('\nStep 2: Authenticating customer credentials...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');
    console.log('✅ Customer authenticated successfully!');
  } catch (err) {
    console.error('❌ Step 2 Failed:', err.message);
    process.exit(1);
  }

  // 3. Create an order (simulate Checkout)
  try {
    console.log('\nStep 3: Creating a luxury gift hamper order (Checkout simulation)...');
    const orderPayload = {
      products: [{
        productId: '65e7c8e9b23c9a1234567890',
        name: 'Royal Premium Golden Hamper',
        quantity: 1,
        price: 4999,
        personalization: {
          customMessage: 'Happy Celebration!',
          ribbonColor: 'Crimson Gold'
        }
      }],
      totalAmount: 5149, // includes 150 shipping fee
      shippingAddress: {
        name: testName,
        phone: testPhone,
        street: 'Bangalore Palace Rd',
        city: 'Bangalore',
        state: 'Karnataka',
        zip: '560052'
      },
      paymentMethod: 'stripe_card',
      deliveryDate: '2026-07-10',
      deliveryTime: 'Evening (04:00 PM - 08:00 PM)'
    };

    const orderRes = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify(orderPayload)
    });
    const orderData = await orderRes.json();
    if (!orderRes.ok) throw new Error(orderData.message || 'Order creation failed');
    createdOrderId = orderData._id;
    console.log(`✅ Order placed successfully! Order ID: ${createdOrderId}`);
  } catch (err) {
    console.error('❌ Step 3 Failed:', err.message);
    process.exit(1);
  }

  // 4. Authenticate as Admin
  try {
    console.log('\nStep 4: Authenticating as Administrator...');
    const adminRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@royalhampers.com',
        password: 'admin'
      })
    });
    const adminData = await adminRes.json();
    if (!adminRes.ok) throw new Error(adminData.message || 'Admin login failed');
    adminToken = adminData.token;
    console.log('✅ Admin authenticated successfully!');
  } catch (err) {
    console.error('❌ Step 4 Failed:', err.message);
    process.exit(1);
  }

  // 5. Fetch delivery staff list as Admin
  try {
    console.log('\nStep 5: Retrieving list of active delivery executives...');
    const staffRes = await fetch(`${API_BASE}/orders/delivery-staff`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const staffList = await staffRes.json();
    if (!staffRes.ok) throw new Error(staffList.message || 'Failed to fetch staff');
    
    const raju = staffList.find(s => s.email === 'delivery@royalhampers.com');
    if (!raju) throw new Error('Raju Delivery Executive not pre-seeded in the database!');
    rajuStaffId = raju._id;
    console.log(`✅ Active Delivery Staff found: ${raju.name} (ID: ${rajuStaffId})`);
  } catch (err) {
    console.error('❌ Step 5 Failed:', err.message);
    process.exit(1);
  }

  // 6. Assign Order to Delivery Staff
  try {
    console.log(`\nStep 6: Assigning order ${createdOrderId} to delivery executive Raju...`);
    const assignRes = await fetch(`${API_BASE}/orders/${createdOrderId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ staffId: rajuStaffId })
    });
    const assignData = await assignRes.json();
    if (!assignRes.ok) throw new Error(assignData.message || 'Assignment failed');
    
    // In our orderController.js assignOrder returns the updated order
    targetOTP = assignData.deliveryOTP;
    console.log(`✅ Order status updated to: ${assignData.orderStatus}`);
    console.log(`🔑 Secure Delivery verification OTP generated: ${targetOTP}`);
  } catch (err) {
    console.error('❌ Step 6 Failed:', err.message);
    process.exit(1);
  }

  // 7. Authenticate as Delivery Staff
  try {
    console.log('\nStep 7: Authenticating as Delivery Executive...');
    const delRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'delivery@royalhampers.com',
        password: 'delivery'
      })
    });
    const delData = await delRes.json();
    if (!delRes.ok) throw new Error(delData.message || 'Delivery worker login failed');
    deliveryToken = delData.token;
    console.log('✅ Delivery Executive authenticated successfully!');
  } catch (err) {
    console.error('❌ Step 7 Failed:', err.message);
    process.exit(1);
  }

  // 8. Fetch assigned deliveries
  try {
    console.log('\nStep 8: Retrieving assigned schedule list for Raju...');
    const schedRes = await fetch(`${API_BASE}/orders/delivery/my-assignments`, {
      headers: { 'Authorization': `Bearer ${deliveryToken}` }
    });
    const schedule = await schedRes.json();
    if (!schedRes.ok) throw new Error(schedule.message || 'Failed to fetch assignments');
    
    const hasOrder = schedule.some(o => o._id === createdOrderId);
    if (!hasOrder) throw new Error(`Assigned order ${createdOrderId} was not listed in Raju's schedule!`);
    console.log('✅ Order successfully loaded in delivery executive console list!');
  } catch (err) {
    console.error('❌ Step 8 Failed:', err.message);
    process.exit(1);
  }

  // 9. Verify OTP to mark order as Delivered
  try {
    console.log(`\nStep 9: Submitting verification OTP code (${targetOTP}) to finalize delivery...`);
    const verifyRes = await fetch(`${API_BASE}/orders/${createdOrderId}/verify-delivery`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deliveryToken}`
      },
      body: JSON.stringify({ otp: targetOTP })
    });
    const verifyData = await verifyRes.json();
    if (!verifyRes.ok) throw new Error(verifyData.message || 'OTP Verification failed');
    
    console.log(`✅ Verification complete! Order Status: ${verifyData.orderStatus}`);
    console.log(`💳 Payment status updated to: ${verifyData.paymentStatus}`);
  } catch (err) {
    console.error('❌ Step 9 Failed:', err.message);
    process.exit(1);
  }

  console.log('\n✨ All automated integration tests executed and verified successfully!');
  console.log('🏆 Gajanana Royal Hampers workflow is fully operational and compliant!');
}

runTests();
