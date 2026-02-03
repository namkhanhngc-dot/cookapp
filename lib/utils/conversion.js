// Unit conversion factors to grams/ml
const conversions = {
    // Volume (to ml)
    ml: 1,
    l: 1000,
    tsp: 5,
    tbsp: 15,
    cup: 240,
    'fl oz': 30,
    pint: 473,
    quart: 946,
    gallon: 3785,

    // Weight (to grams)
    g: 1,
    kg: 1000,
    oz: 28.35,
    lb: 453.592,
    mg: 0.001
};

// Scale ingredient quantities
function scaleIngredients(ingredients, originalServings, newServings) {
    const multiplier = newServings / originalServings;

    return ingredients.map(ing => ({
        ...ing,
        quantity: ing.quantity ? (ing.quantity * multiplier).toFixed(2) : ing.quantity
    }));
}

// Convert units
function convertUnit(quantity, fromUnit, toUnit) {
    if (!fromUnit || !toUnit || fromUnit === toUnit) {
        return quantity;
    }

    const from = conversions[fromUnit.toLowerCase()];
    const to = conversions[toUnit.toLowerCase()];

    if (!from || !to) {
        return quantity; // Can't convert unknown units
    }

    // Convert to base unit, then to target unit
    const baseValue = quantity * from;
    return (baseValue / to).toFixed(2);
}

// Format time duration
function formatDuration(minutes) {
    if (!minutes) return '';

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${mins} min`;
}

module.exports = {
    scaleIngredients,
    convertUnit,
    formatDuration
};
