fixture('Github Website Testing Suite', function() {
    this.timeout(0);

    fixture('Innter Suite 1 - Github welcome page testing', function() {
        scenario('should open welcome page', async function(I) {
            await I.amOnPage('https://github.com');
        });

        scenario('should fail to create account', async function(I) {
            await I.amOnPage('https://github.com');
            await I.fillInput('input[id="user[login]"]', 'testUser');
            await I.fillInput('input[id="user[email]"]', 'testUser@test.com');
            await I.fillInput('input[id="user[password]"]', 'password');
            await I.fillInput('input[id="user[not-on-page]"]', 'something', 1000);
            await I.wait(10000);
        });
    })

    fixture('Innter Suite 2 - Github pricing page testing', function() {
        scenario('should open pricing page', async function(I) {
            await I.amOnPage('https://github.com/pricing');
        })
    })
})
