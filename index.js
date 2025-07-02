"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scrapingbee_1 = require("scrapingbee");
const APIKey = 'D3HROBYAXKQQFHLI07P4LAX4Q4MEYP1UV4PO6QV6024BSIGCYL7MSUDK0F05T0UMOPN76L2MOUAL3K5G';
const TestPageURL = "https://docs.google.com/forms/d/e/1FAIpQLSez2X2gKbvrc7K2c70eKAZqCuPlm_REtKkQR7nYI-uQaXjd7w/viewform";
const client = new scrapingbee_1.ScrapingBeeClient(APIKey);
client.get({
    url: TestPageURL,
    headers: {
        'Accept-Language': 'En-US',
    },
    params: {
        custom_google: true,
        block_resources: false,
        'js_scenario': {
            'instructions': [
                { 'click': '#i12' },
                { 'click': '[aria-label="4"][data-value="4"]' },
                { 'fill': ['[name*="_month"]', '08'] },
                { 'fill': ['[name*="_day"]', '17'] },
                { 'fill': ['[name*="_year"]', '2025'] },
                { 'click': '[aria-label="Submit"]' }
            ]
        }
    },
})
    .then((_) => {
    console.log("Done!");
})
    .catch((e) => console.log('A problem occurs : ' + e.response.data));
