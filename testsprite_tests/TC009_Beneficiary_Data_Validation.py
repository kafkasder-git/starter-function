import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Input username and password and click login button to access beneficiary form.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('isahamid095@gmail.com')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('Vadalov95.')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click on 'Yeni İhtiyaç Sahibi' (New Beneficiary) button to open beneficiary data entry form.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/main/div/div/div/div/div[3]/div/div[2]/div/div/div/div[2]/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click the 'Yeni İhtiyaç Sahibi Ekle' button (index 29) to open the beneficiary data entry form.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/main/div/div/div/div/div/div/div/div[2]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click 'Kaydet ve Devam Et' (Save and Continue) button with index 33 to attempt submission with empty required fields and check for validation errors.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[3]/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Input invalid data into 'Kimlik No' (ID number), 'Telefon' (phone), and 'IBAN' fields to test validation messages and submission prevention.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[3]/div[2]/div[2]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('invalidID123')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[3]/div[2]/div[3]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('123abc456')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[3]/div[2]/div[7]/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('INVALIDIBAN123')
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div[3]/div[3]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert validation errors are displayed for empty required fields after clicking 'Kaydet ve Devam Et' button.
        validation_error_selector = 'xpath=//div[contains(@class, "validation-error") or contains(text(), "zorunlu")]'
        validation_errors = await frame.locator(validation_error_selector).all()
        assert len(validation_errors) > 0, "Expected validation errors for empty required fields, but none were found."
        # Assert validation messages for invalid 'Kimlik No', 'Telefon', and 'IBAN' fields after inputting invalid data and attempting submission.
        invalid_id_error = await frame.locator('xpath=//div[contains(text(), "Kimlik No") and contains(text(), "geçersiz")]').count()
        invalid_phone_error = await frame.locator('xpath=//div[contains(text(), "Telefon") and contains(text(), "geçersiz")]').count()
        invalid_iban_error = await frame.locator('xpath=//div[contains(text(), "IBAN") and contains(text(), "geçersiz")]').count()
        assert invalid_id_error > 0, "Expected validation error for invalid Kimlik No, but none found."
        assert invalid_phone_error > 0, "Expected validation error for invalid Telefon, but none found."
        assert invalid_iban_error > 0, "Expected validation error for invalid IBAN, but none found."
        # Assert that form submission is prevented by checking that the form is still visible or the submit button is enabled after invalid submission attempt.
        submit_button = frame.locator('xpath=html/body/div[3]/div[3]/button[2]').nth(0)
        assert await submit_button.is_enabled(), "Submit button should still be enabled indicating submission was prevented due to validation errors."
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    