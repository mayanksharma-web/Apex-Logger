chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message == "getSession") {
        chrome.cookies.get({ url: "https://" + request.sfHost, name: "sid", storeId: sender.tab?.cookieStoreId }, sessionCookie => {
            if (!sessionCookie) {
                sendResponse(null);
                return;
            }
            let session = { key: sessionCookie.value, hostName: sessionCookie.domain };
            sendResponse(session);
        });
        return true;
    }
});