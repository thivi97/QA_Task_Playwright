# QA_Task_Playwright

📦 Overview

This project automates the testing of the "Related Products (Best Sellers)" feature for eBay wallet listings. It verifies that related items are displayed correctly and meet business requirements like price range, category, and proper UI structure.

The automation is built using Playwright with JavaScript, following the Page Object Model (POM) pattern.

📌 Features Covered

✅ Load eBay home page and verify title
✅ Search for a product (e.g., wallet)
✅ Click and validate the first product from results
✅ Extract and validate product title. price, description
✅ Handle fallback if product price/ description is missing
✅ Validate the related product section 
✅ Handle page reload and verify item consistency
✅ Test fallback/ error 

🛠️ Setup Instructions

📥 Install Dependencies
npm install

⚙️ Install Playwright Browsers
npx playwright install

▶️ Run The Tests
npx playwright test

🧪 Run a Specific Test
npx playwright test tests/mainProductPage.spec.js

