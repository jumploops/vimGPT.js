import { Page, chromium, ChromiumBrowserContext } from 'playwright';
import sharp from 'sharp';

export class Vimbot {
  private context!: ChromiumBrowserContext;
  private page!: Page;
  private vimiumPath: string = "./vimium-master";

  constructor() {
  }

  async initialize(headless: boolean = false): Promise<void> {
    this.context = await chromium.launchPersistentContext('', {
      headless,
      args: [
        `--disable-extensions-except=${this.vimiumPath}`,
        `--load-extension=${this.vimiumPath}`,
      ],
      ignoreHTTPSErrors: true
      // ...other options
    });

    this.page = await this.context.newPage();
    await this.page.setViewportSize({ width: 1080, height: 720 });
  }

  async performAction(action: any): Promise<boolean> {
    if (action.action === 'done') {
      return true;
    }
    if (action.action === 'type') {
      await this.click(action.character_string);
      await this.type(action.type_input);
    }
    if (action.action === 'navigate') {
      await this.navigate(action.url);
    }
    if (action.action === 'click') {
      await this.click(action.character_string);
    }
    return false;
  }

  async navigate(url: string): Promise<void> {
    await this.page.goto(url.includes('://') ? url : 'https://' + url, { timeout: 60000 });
  }

  async type(text: string): Promise<void> {
    await new Promise(r => setTimeout(r, 1000)); // Sleep for 1 second
    await this.page.keyboard.type(text);
    await this.page.keyboard.press("Enter");
  }

  async click(text: string): Promise<void> {
    await this.page.keyboard.type(text);
  }

  async capture(): Promise<Buffer> {
    await this.page.keyboard.press("Escape");
    await this.page.keyboard.type("f");

    // The screenshot will be taken and stored as a Buffer.
    const screenshotBuffer = await this.page.screenshot();

    // Processing the image using sharp to convert it to RGB
    const sharpImage = await sharp(screenshotBuffer).toFormat('jpeg').toBuffer();
    return sharpImage; // Now the function returns a Buffer
  }
}
