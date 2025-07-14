document.addEventListener('DOMContentLoaded', () => {

    // --- DOM ELEMENTS ---
    const dom = {
        vouchersDistributed: document.getElementById('vouchersDistributed'),
        maxSubsidy: document.getElementById('maxSubsidy'),
        avgFare: document.getElementById('avgFare'),
        programBudget: document.getElementById('programBudget'),
        claimRate: document.getElementById('claimRate'),
        expectedRedemptionRate: document.getElementById('expectedRedemptionRate'),
        redemptionRateValue: document.querySelector('.slider-value'),
        maxTripsAvailable: document.getElementById('maxTripsAvailable'),
        tripDistributionContainer: document.getElementById('trip-distribution-container'),
        actualTotal: document.getElementById('actualTotal'),
        actualTotalError: document.getElementById('actualTotalError'),
        resetDistributionButton: document.getElementById('resetDistributionBtn'),
        modelButtons: document.getElementById('model-selector'),
        calculateButton: document.getElementById('calculate'),

        totalSpend: document.getElementById('totalSpend'),
        budgetValue: document.getElementById('budgetValue'),
        utilization: document.getElementById('utilization'),
        totalTrips: document.getElementById('totalTrips'),
        avgTripsPerRider: document.getElementById('avgTripsPerRider'),
        riders: document.getElementById('riders'),
        riderCostPerTrip: document.getElementById('riderCostPerTrip'),
        totalRiderCost: document.getElementById('totalRiderCost'),
    };

    // --- INITIAL STATE from Screenshot ---
    // This data is used to populate the trip distribution sliders
    const initialDistribution = [70.0, 0.99, 1.88, 3.04, 4.18, 4.91, 4.91, 4.18, 3.04, 1.88, 0.99];

    /**
     * Renders the trip distribution sliders in the UI.
     */
    function renderTripDistribution() {
        dom.tripDistributionContainer.innerHTML = ''; // Clear existing sliders
        const maxTrips = parseInt(dom.maxTripsAvailable.value, 10) || 10;

        for (let i = 0; i <= maxTrips; i++) {
            const value = initialDistribution[i] || 0;
            const disabled = i == 0 ? 'disabled' : ''

            const item = document.createElement('div');
            item.className = `distribution-item  ${disabled}`;

            item.innerHTML = `
      <div class="input-group">
      <label for="dist-trip-${i}">Take ${i} Trip(s)</label>
      <div class="input-with-unit unit-percent">
        <input type="number" id="dist-trip-${i}" min="0" max="100" value="${value}" step="0.1" class="slider-input" ${disabled}>
      </div>
      </div>
      `;
            // <span className="percentage">${value.toFixed(2)}%</span>
            dom.tripDistributionContainer.appendChild(item);
        }
        updateEventListenersForDistribution();
        resetDistribution();
        updateActualTotal();
    }


    function resetDistribution() {

        document.getElementById('dist-trip-0').value = 100 - dom.expectedRedemptionRate.value;

        const sliders = dom.tripDistributionContainer.querySelectorAll('input[type="number"]');

        let values = getDistribution(sliders.length - 1)

        sliders.forEach((slider, index) => {

            if (index > 0) {
                slider.value = values[index - 1];
            }
        });
    }

    /**
     * Updates the "Actual Total" percentage based on slider values.
     */
    function updateActualTotal() {


        const sliders = dom.tripDistributionContainer.querySelectorAll('input[type="number"]');
        let total = 0;
        sliders.forEach((slider, index) => {

            if (index > 0) {
                total += parseFloat(slider.value);
            }
        });
        dom.actualTotal.textContent = `Actual Total for Riders: ${total.toFixed(1)}%`;

        total = parseFloat(total.toFixed(1));
        let expectedRedemptionRate = parseFloat(dom.expectedRedemptionRate.value)
        let diff = parseFloat((total - expectedRedemptionRate).toFixed(1));
        console.log(total, expectedRedemptionRate, diff);
        if (total > parseFloat(dom.expectedRedemptionRate.value)) {
            actualTotalError.innerText = `Error: Remove ${diff}% from the list.`;
            dom.calculateButton.disabled = true;
        } else if (total < parseFloat(dom.expectedRedemptionRate.value)) {
            actualTotalError.innerText = `Error: Add ${diff}% from the list`;
            dom.calculateButton.disabled = true;
        } else {
            actualTotalError.innerText = '';
            dom.calculateButton.disabled = false;
        }
    }

    /**
     * Adds event listeners to all dynamically created sliders.
     */
    function updateEventListenersForDistribution() {
        const sliders = dom.tripDistributionContainer.querySelectorAll('.distribution-item');
        sliders.forEach(item => {
            const slider = item.querySelector('input[type="number"]');
            const percentageSpan = item.querySelector('.percentage');

            slider.addEventListener('input', () => {
                // percentageSpan.textContent = `${parseFloat(slider.value).toFixed(1)}%`;
                let val = parseFloat(slider.value);
                if (!isNaN(val)) {
                    slider.value = val.toFixed(1);
                }
                updateActualTotal();
            });
        });
    }

    /**
     * Updates the display value for the main redemption rate slider.
     */
    dom.expectedRedemptionRate.addEventListener('input', () => {
        // dom.redemptionRateValue.textContent = `${dom.expectedRedemptionRate.value}%`;
        resetDistribution();
        updateActualTotal();
    });
    dom.resetDistributionButton.addEventListener('click', () => {
        resetDistribution();
        updateActualTotal();
    });
    dom.calculateButton.addEventListener('click', () => {
        calculate()
    });

    /**
     * Re-renders the distribution sliders when the max trips value changes.
     */
    dom.maxTripsAvailable.addEventListener('change', () => {
        renderTripDistribution();
    });

    dom.modelButtons.addEventListener('click', () => {

        const clickedButton = event.target.closest('.model-button');

        if (clickedButton) {
            document.querySelectorAll('.model-button').forEach(button => {
                button.classList.remove('active');
            });

            clickedButton.classList.add('active');

            const selectedModel = clickedButton.dataset.model;
            console.log("Selected model:", selectedModel);

            switch (selectedModel) {
                case 'university':
                    dom.claimRate.value = '20'
                    dom.expectedRedemptionRate.value = '30'
                    break;
                case 'transit':
                    dom.claimRate.value = '60'
                    dom.expectedRedemptionRate.value = '40'
                    break;
                case 'general':
                    dom.claimRate.value = '50'
                    dom.expectedRedemptionRate.value = '50'
                    break;
            }

            resetDistribution();
            updateActualTotal();
        }
    });

    // --- INITIALIZATION ---
    // Render the dynamic parts of the page on load.
    renderTripDistribution();
    calculate();


    function calculate() {

        let vouchersDistributed = dom.vouchersDistributed.value;
        let claimRate = dom.claimRate.value;
        let expectedRedemptionRate = dom.expectedRedemptionRate.value;
        let maxSubsidy = dom.maxSubsidy.value;
        let avgFare = dom.avgFare.value;

        let programBudget = dom.programBudget.value

        const sliders = dom.tripDistributionContainer.querySelectorAll('input[type="number"]');
        let total = 0;
        let totalTrips = 0;
        sliders.forEach((slider, index) => {

            if (index > 0) {
                total += vouchersDistributed * (claimRate / 100) * (parseFloat(slider.value) / 100) * index * Math.min(maxSubsidy, avgFare);
                totalTrips += vouchersDistributed * (claimRate / 100) * (parseFloat(slider.value) / 100) * index;
            }
        });

        dom.totalSpend.innerHTML = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(total);

        dom.budgetValue.innerHTML = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(programBudget - total);

        dom.utilization.innerHTML = new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format((claimRate / 100) * (expectedRedemptionRate / 100));

        dom.totalTrips.innerText = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(totalTrips);

        let avgTripsPerRider = vouchersDistributed * (claimRate / 100) * (expectedRedemptionRate / 100)
        dom.riders.innerText = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(avgTripsPerRider);

        dom.avgTripsPerRider.innerText = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }).format(totalTrips / avgTripsPerRider);

        dom.riderCostPerTrip.innerText = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Math.max(avgFare - maxSubsidy, 0));

        dom.totalRiderCost.innerText = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(Math.max(avgFare - maxSubsidy, 0) * totalTrips);
    }


    function normalPDF(x, mu, sigma) {
        return Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI));
    }

    function getDistribution(n) {
        const total = parseFloat(dom.expectedRedemptionRate.value);
        const mu = (n + 1) / 2;
        const sigma = n / 6;

        let raw = [];
        for (let i = 1; i <= n; i++) {
            raw.push(normalPDF(i, mu, sigma));
        }

        const sum = raw.reduce((a, b) => a + b, 0);
        const unrounded = raw.map(p => (p / sum) * total);

        // 四捨五入到小數點第一位
        let values = unrounded.map(v => parseFloat(v.toFixed(1)));

        // 修正總和誤差（加到最後一個值）
        const roundedTotal = values.reduce((a, b) => a + b, 0);
        const diff = parseFloat((total - roundedTotal).toFixed(1));

        values[values.length - 1] = parseFloat((values[values.length - 1] + diff).toFixed(1));

        return values;
    }

});