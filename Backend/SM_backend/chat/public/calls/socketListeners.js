function registerSocketListeners(socket) {
    socket.on('availableOffers', (offers) => {
        createOfferEls(offers);
    });

    socket.on('newOfferAwaiting', (offers) => {
        createOfferEls(offers);
    });

    socket.on('answerResponse', (offerObj) => {
        addAnswer(offerObj);
        waitingEl.style.display = 'none';
        activePeerUserName = offerObj.answererUserName || null;
    });

    socket.on('receivedIceCandidateFromServer', (iceCandidate) => {
        addNewIceCandidate(iceCandidate);
    });

    socket.on('peerHangup', () => {
        hangupLocally();
    });
}

function createOfferEls(offers) {
    offers.forEach((offerObj) => {
        if (renderedOffers.has(offerObj.offererUserName)) {
            return;
        }

        renderedOffers.add(offerObj.offererUserName);

        const newOfferEl = document.createElement('div');
        newOfferEl.innerHTML = `<button class="btn btn-success">Válasz ${offerObj.offererUserName}</button>`;
        newOfferEl.addEventListener('click', async () => {
            newOfferEl.remove();
            renderedOffers.delete(offerObj.offererUserName);
            await answerOffer(offerObj);
        });
        answerContainer.appendChild(newOfferEl);
    });
}
