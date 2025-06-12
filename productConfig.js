// product.js

const BATHTUB_DESCRIPTION = "Entfernung der bestehenden Badewanne mit sehr hohem Einstieg und Einbau einer bodennahen Dusche.";
const BATHTHUB_REASON = "ich nicht mehr sicher in meine Badewanne mit einem sehr hohen Einstieg komme. Ich brauche eine bodennahe Dusche, um meine Selbstständigkeit zu bewahren. Die bodennahe Dusche ermöglicht es mir, das Badezimmer sicher zu nutzen, ohne mich der Gefahr auszusetzen, beim Ein- oder Aussteigen aus der Badewanne schwer zu stürzen.";


const SHOWER_DESCRIPTION = "Entfernung der bestehenden Dusche mit sehr hohem Einstieg und Einbau einer bodennahen Dusche.";
const SHOWER_REASON = "ich nicht mehr sicher in meine Dusche mit einem sehr hohen Einstieg komme. Ich brauche eine bodennahe Dusche, um meine Selbstständigkeit zu bewahren. Die bodennahe Dusche ermöglicht es mir, das Badezimmer sicher zu nutzen, ohne mich der Gefahr auszusetzen, beim Ein- oder Aussteigen aus der Badewanne schwer zu stürzen.";

const TOILET_DESCRIPTION = "Einbau eines neuen, erhöhten WCs, um die Nutzung des WCs zu erleichtern.";
const TOILET_REASON = "ich nicht mehr sicher auf die Toilette komme. Ich brauche ein erhöhten WC, um meine Selbstständigkeit zu bewahren. Das neue WC ermöglicht es mir, das Badezimmer sicher zu nutzen, ohne mich zu verletzen.";

const TOILET_DESCRIPTION_GRAB_BARS = "Einbau eines neuen, erhöhten WCs mit Haltegriffen, um die Nutzung des WCs zu erleichtern.";
const TOILET_REASON_GRAB_BARS = "ich nicht mehr sicher auf die Toilette komme. Ich brauche ein erhöhten WC mit Haltegriffen, um meine Selbstständigkeit zu bewahren. Das neue WC ermöglicht es mir, das Badezimmer sicher zu nutzen, ohne mich zu verletzen.";

const SINK_DESCRIPTION = "Einbau eines neuen, erhöhten Waschbeckens, um die Nutzung des Waschbeckens zu erleichtern.";
const SINK_REASON = "ich nicht mehr sicher an das Waschbecken komme. Ich brauche ein erhöhtes Waschbecken, um meine Selbstständigkeit zu bewahren. Das neue Waschbecken ermöglicht es mir, das Badezimmer sicher zu nutzen, ohne mich zu verletzen.";

const PRODUCT_CONFIG = {
    bathtub_to_shower: {
        description: BATHTUB_DESCRIPTION,
        reason: BATHTHUB_REASON,
        productName: "Badewanne",
        productType: "bathtub_to_shower",
    },
    shower_to_shower: {
        description: SHOWER_DESCRIPTION,
        reason: SHOWER_REASON,
        productName: "Dusche",
        productType: "shower_to_shower",
    },
    raised_toilet: {
        description: TOILET_DESCRIPTION,
        reason: TOILET_REASON,
        productName: "WC",
        productType: "raised_toilet",
    },
    // toiletWithGrabBars: {
    //     description: TOILET_DESCRIPTION_GRAB_BARS,
    //     reason: TOILET_REASON_GRAB_BARS,
    //     productName: "WC mit Haltegriffen",
    //     productType: "toiletWithGrabBars",
    // },
    // sink: {
    //     description: SINK_DESCRIPTION,
    //     reason: SINK_REASON,
    //     productName: "Waschbecken",
    //     productType: "sink",
    // },
};

export function getProductDefinitions(productType) {
    console.log("getProductDefinitions called with productType:", productType);
    if (!productType || typeof productType !== 'string') {
        console.warn("Invalid productType provided:", productType);
        return null;
    }
    return PRODUCT_CONFIG[productType] || null;
}
