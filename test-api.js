const axios = require('axios');

async function testApi(url) {
    console.log(`Testing: ${url}`);
    try {
        const response = await axios.get(url, { timeout: 5000 });
        console.log(`✅ Success! Status: ${response.status}`);
        console.log(`Data Type: ${typeof response.data}`);
        if (typeof response.data === 'object') {
            console.log('Sample Data:', JSON.stringify(response.data).substring(0, 100));
        } else {
            console.log('Response starts with:', response.data.toString().substring(0, 100));
        }
    } catch (error) {
        console.log(`❌ Failed! Error: ${error.message}`);
        if (error.response) {
            console.log(`Status: ${error.response.status}`);
        }
    }
    console.log('-----------------------------------');
}

async function runTests() {
    const endpoints = [
        'https://api.chooseyourtherapist.in/api/get-therapists-profile',
        'https://chooseyourtherapist.in/api/get-therapists-profile',
        'http://localhost:4000/api/get-therapists-profile'
    ];

    for (const url of endpoints) {
        await testApi(url);
    }
}

runTests();
