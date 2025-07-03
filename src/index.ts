// https://www.scrapingbee.com/documentation/

// Note to self: remember that the scraping might be done in different locales and languages, so
// don't rely too much on localized stuff like aria values

import { ScrapingBeeClient } from "scrapingbee";
import { writeFileSync } from "fs";

// ScrapingBee API key (watchout for credits)

const APIKey = 'D3HROBYAXKQQFHLI07P4LAX4Q4MEYP1UV4PO6QV6024BSIGCYL7MSUDK0F05T0UMOPN76L2MOUAL3K5G';

// A simple Google form test page. The admin page can be reached at:
// https://docs.google.com/forms/d/10XG3gPDFOxvZf9cze4AugKoTKXc7If6UTqA8rCKckAY/edit

const TestPageURL = "https://docs.google.com/forms/d/e/1FAIpQLSez2X2gKbvrc7K2c70eKAZqCuPlm_REtKkQR7nYI-uQaXjd7w/viewform";

// Initialize a fresh ScrappingBee's client

const client = new ScrapingBeeClient(APIKey);

// Our object model

interface AppleModel {
  kind: string[],
  discount: string[]
}

// Service layer

class AppleService {
  private _url: string;
  private _client: ScrapingBeeClient;

  // RTFM

  private _getAvailableApplesRules = {
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

  constructor(client: ScrapingBeeClient, url: string) {
    this._url = url;
    this._client = client
  }

  // Scrape the demo Google form and returns our model

  async getAvailable(): Promise<AppleModel> {
    const response = await this._client.get({
      url: this._url,
      params: {
        custom_google: true,
        'ai_query': this._getAvailableApplesRules.query,
        'ai_extract_rules': this._getAvailableApplesRules.rules,
      }
    })
    return JSON.parse(new TextDecoder().decode(response.data));
  }

  // Take a screenshot of the webview. Say 'cheese'

  async takeScreenshot(path: string, window_width: number = 375) {
    const response = await this._client.get({
      url: this._url,
      params: {
        custom_google: true,
        screenshot: true,
        screenshot_full_page: true,
        window_width,
      }
    });

    writeFileSync(path, response.data);
  }

  // Submit some answers in the demo Google form

  async submitDemoOrder() {

    // Maybe factor out stuff like 'js_scenario' in production like we did
    // for 'ai_query' and 'ai_extract_rules'

    await this._client.get({
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
    })
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
  .catch((_) => console.log('Demo order submitted (yeah, this is not really an error. See comments)'));
