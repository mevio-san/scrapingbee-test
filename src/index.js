"use strict";
// https://www.scrapingbee.com/documentation/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Note to self: remember that the scraping might be done in different locales and languages, so
// don't rely too much on localized stuff like aria values
const scrapingbee_1 = require("scrapingbee");
const fs_1 = require("fs");
// ScrapingBee API key (watchout for credits)
const APIKey = 'D3HROBYAXKQQFHLI07P4LAX4Q4MEYP1UV4PO6QV6024BSIGCYL7MSUDK0F05T0UMOPN76L2MOUAL3K5G';
// A simple Google form test page
const TestPageURL = "https://docs.google.com/forms/d/e/1FAIpQLSez2X2gKbvrc7K2c70eKAZqCuPlm_REtKkQR7nYI-uQaXjd7w/viewform";
// Initialize a fresh ScrappingBee's client
const client = new scrapingbee_1.ScrapingBeeClient(APIKey);
// Service layer
class AppleService {
    constructor(client, url) {
        // RTFM
        this._getAvailableApplesRules = {
            query: "return a list of apple types and discount rates (as numbers)",
            rules: JSON.stringify({
                kind: {
                    description: "the kind of apple",
                    type: "list"
                },
                discount: {
                    description: "the discount rate",
                    type: "list"
                },
            })
        };
        this._url = url;
        this._client = client;
    }
    // Scrape the demo Google form and returns our model
    getAvailable() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this._client.get({
                url: this._url,
                params: {
                    custom_google: true,
                    'ai_query': this._getAvailableApplesRules.query,
                    'ai_extract_rules': this._getAvailableApplesRules.rules,
                }
            });
            return JSON.parse(new TextDecoder().decode(response.data));
        });
    }
    // Take a screenshot of the webview. Say 'cheese'
    takeScreenshot(path_1) {
        return __awaiter(this, arguments, void 0, function* (path, window_width = 375) {
            const response = yield client.get({
                url: this._url,
                params: {
                    custom_google: true,
                    screenshot: true,
                    screenshot_full_page: true,
                    window_width,
                }
            });
            (0, fs_1.writeFileSync)(path, response.data);
        });
    }
    // Submit some answers in the demo Google form
    submitDemoOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            // Maybe factor out stuff like 'js_scenario' in production like we did
            // for 'ai_query' and 'ai_extract_rules'
            yield client.get({
                url: this._url,
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
            });
        });
    }
}
const appleService = new AppleService(client, TestPageURL);
appleService.getAvailable()
    .then((inventory) => console.log(`Successfully retrieved apples: ${JSON.stringify(inventory)}`))
    .catch((e) => console.log('A problem occurred while retrieving apples: ' + e.response.data));
appleService.takeScreenshot('apple_form.png')
    .then(() => console.log('Successfully retrieved a screenshot'))
    .catch((e) => console.log('A problem occurred while screenshotting: ' + e.response.data));
// submitDemoOrder raises an exception because we are leaving the page after the form submit action
// You can safely ignore it in this simple PoC, but take care of stuff like that in production
appleService.submitDemoOrder()
    .then(() => console.log('Demo order submitted'))
    .catch((_) => console.log('Demo order submitted (yeah, this is not really an error. TBD)'));
