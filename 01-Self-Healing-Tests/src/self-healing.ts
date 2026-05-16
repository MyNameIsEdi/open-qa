import { chromium, Page } from 'playwright';
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // מושך את המפתח מהתיקייה הראשית

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * פונקציית הריפוי: פונה ל-AI עם ה-HTML הנוכחי ומבקשת סלקטור חדש
 */
async function healLocator(htmlContent: string, targetDescription: string): Promise<string> {
  console.log(`\n🚑 [Self-Healing] Element not found! Asking AI to find: "${targetDescription}"...`);

  const prompt = `
    You are an expert QA Automation Engineer. 
    A UI test just failed because a CSS selector was changed by the developers.
    
    The tester was trying to interact with: "${targetDescription}"
    
    Here is the current HTML of the page (minified):
    ${htmlContent}
    
    Analyze the HTML and return the BEST, most robust CSS selector for this element.
    Return ONLY the raw CSS selector string. Do not include markdown, quotes, or explanations.
  `;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, // אנחנו רוצים תשובה מדויקת ולא יצירתית
    });

    const newSelector = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    console.log(`✨ [Self-Healing] AI suggests new selector: "${newSelector}"`);
    return newSelector;

  } catch (error) {
    console.error("❌ Failed to heal locator using AI:", error);
    throw error;
  }
}

/**
 * הפעלת תרחיש הבדיקה (Demo)
 */
async function runDemoTest() {
  const browser = await chromium.launch({ headless: false }); // נראה את הדפדפן נפתח
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. אנחנו מדמים אתר שצוות הפיתוח שינה בו את הסלקטורים
  const mockPageHtml = `
    <html>
      <body style="font-family: Arial; padding: 50px;">
        <h2>Checkout Page</h2>
        <div class="cart-container">
          <button data-test-id="checkout-confirm-button" class="btn primary-action">Complete Order</button>
        </div>
      </body>
    </html>
  `;
  await page.setContent(mockPageHtml);

  // 2. הטסט הישן והשבור שלנו
  const oldBrokenSelector = '#old-submit-btn';
  const elementDescription = "The button used to complete the order/checkout";

  console.log(`\n▶️ Test started: Trying to click using old selector: "${oldBrokenSelector}"...`);

  try {
    // מנסים ללחוץ על הסלקטור הישן (ייכשל ויזרוק שגיאה אחרי שנייה)
    await page.click(oldBrokenSelector, { timeout: 1000 });
    console.log("✅ Clicked successfully! (Wait, this shouldn't happen)");
  } catch (error) {
    // 3. תפיסת השגיאה והפעלת ה-Self Healing
    const pageHtml = await page.innerHTML('body'); // לוקחים את ה-DOM הנוכחי
    
    // קוראים ל-Claude
    const newSelector = await healLocator(pageHtml, elementDescription);
    
    if (newSelector) {
      console.log(`🔄 Retrying action with new selector: "${newSelector}"...`);
      // מנסים שוב עם הסלקטור שה-AI מצא
      await page.click(newSelector, { timeout: 2000 });
      console.log("🎉 SUCCESS! The test healed itself and passed.");
      
      // בונוס תצוגה ויזואלית בדפדפן לפני שנסגר
      await page.evaluate((sel) => {
        document.querySelector(sel).style.backgroundColor = '#33ff00';
        document.querySelector(sel).innerText = 'Healed by AI!';
      }, newSelector);
      await page.waitForTimeout(3000); 
    }
  }

  await browser.close();
}

runDemoTest();
