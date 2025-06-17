// product.js

const GRAB_BARS_DESCRIPTION_DESCRIPTION = "Anbringung von Haltegriffen zur sicheren Unterstützung beim Aufstehen, Hinsetzen und Drehen im Bad.";
const GRAB_BARS_DESCRIPTION_REASON = "Aktuell keine sicheren Haltepunkte vorhanden, wodurch die Sturzgefahr beim Toilettengang oder Duschen deutlich erhöht ist.";

const RAILINGS_DESCRIPTION = "Installation eines Wandgeländers zur Mobilitätsunterstützung im Eingangs- oder Treppenbereich.";
const RAILINGS_REASON = "Ohne Geländer besteht ein erhöhtes Risiko bei der Überwindung von Höhenunterschieden, insbesondere beim Gehen mit Rollator oder Stütze.";

const RAISED_TOILET_DESCRIPTION = "Austausch des WCs gegen eine erhöhte Variante zur Erleichterung des Setzens und Aufstehens.";
const RAISED_TOILET_REASON = "Der niedrige Toilettensitz führt zu starkem Kraftaufwand und birgt hohes Risiko für Stürze oder pflegerische Überlastung.";

const THRESHOLD_REMOVAL_DESCRIPTION = "Entfernung der Türschwelle zur Schaffung eines barrierefreien Übergangs zwischen Räumen.";
const THRESHOLD_REMOVAL_REASON = "Die Türschwelle stellt ein gefährliches Hindernis dar - besonders mit Rollator, Gehhilfe oder unsicherem Gangbild.";

const RAMPS_DESCRIPTION = "Einbau einer Rampe zur Überwindung eines Höhenunterschieds, z.B. am Wohnungseingang oder zur Terrasse.";
const RAMPS_REASON = "Der bestehende Höhenversatz kann ohne Rampe nicht selbstständig überwunden werden, was die Teilhabe am Alltag einschränkt.";

const DOOR_WIDENING_DESCRIPTION = "Verbreiterung der Türöffnung zur Rollator- oder Rollstuhlgerechten Nutzung.";
const DOOR_WIDENING_REASON = "Die aktuelle Türbreite erlaubt kein Durchkommen mit Mobilitätshilfen - eigenständige Raumnutzung ist stark eingeschränkt.";

const WHEELCHAIR_SINK_DESCRIPTION = "Montage eines unterfahrbaren Waschtisches zur eigenständigen Körperpflege im Sitzen.";
const WHEELCHAIR_SINK_REASON = "Der Standard-Waschtisch ist nicht nutzbar mit Rollstuhl/Rollator = eigenständige Hygiene ist nicht möglich.";

const BATHTUB_TO_SHOWER_DESCRIPTION = "Umwandlung einer Badewanne in eine bodengleiche Dusche zur sicheren, eigenständigen Körperpflege.";
const BATHTUB_TO_SHOWER_REASON = "Der Einstieg in die Badewanne ist aufgrund eingeschränkter Beweglichkeit und Sturzgefahr nicht mehr zumutbar.";

const SHOWER_TO_SHOWER_DESCRIPTION = "Umbau einer vorhandenen Dusche in eine bodennahe, barrierefreie Dusche.";
const SHOWER_TO_SHOWER_REASON = "Der aktuelle hohe Einstieg stellt ein erhebliches Risiko dar und verhindert eigenständiges Duschen ohne Hilfe.";

const PUMPING_SYSTEM_DESCRIPTION = "Einbau einer Dusche mit Pumpe zur Realisierung eines bodengleichen Ablaufs.";
const PUMPING_SYSTEM_REASON = "Ohne Pumpe ist der Einbau einer bodengleichen Dusche baulich nicht möglich - es bleibt eine gefährliche Einstiegshöhe.";

const BATHTUB_WITH_ENTRY_DESCRIPTION = "Installation einer Badewanne mit Tür zur gefahrlosen Nutzung trotz eingeschränkter Beweglichkeit.";
const BATHTUB_WITH_ENTRY_REASON = "Der klassische Wanneneinstieg ist zu hoch - ein sicherer Zugang ist pflegerisch nicht mehr vertretbar.";




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
    grab_bars: {
description: GRAB_BARS_DESCRIPTION_DESCRIPTION,
reason: GRAB_BARS_DESCRIPTION_REASON,
productType: "grab_bars"
    },
railings: {
description: RAILINGS_DESCRIPTION,
reason: RAILINGS_REASON,
productType: "railings"
},
raised_toilet: {
description: RAISED_TOILET_DESCRIPTION,
reason: RAISED_TOILET_REASON,
productType: "raised_toilet"
},
threshold_removal: {
description: THRESHOLD_REMOVAL_DESCRIPTION,
reason: THRESHOLD_REMOVAL_REASON,
productType: "threshold_removal"
},
ramps: {
description: RAMPS_DESCRIPTION,
reason: RAMPS_REASON,
productType: "ramps"
},
door_widening: {
description: DOOR_WIDENING_DESCRIPTION,
reason: DOOR_WIDENING_REASON,
productType: "door_widening"
},
wheelchair_sink: {
description: WHEELCHAIR_SINK_DESCRIPTION,
reason: WHEELCHAIR_SINK_REASON,
productType: "wheelchair_sink"
},
bathtub_to_shower: {
description: BATHTUB_TO_SHOWER_DESCRIPTION,
reason: BATHTUB_TO_SHOWER_REASON,
productType: "bathtub_to_shower"
},
shower_to_shower: {
description: SHOWER_TO_SHOWER_DESCRIPTION,
reason: SHOWER_TO_SHOWER_REASON,
productType: "shower_to_shower"
},
pumping_system: {
description: PUMPING_SYSTEM_DESCRIPTION,
reason: PUMPING_SYSTEM_REASON,
productType: "pumping_system"
},
bathtub_with_entry: {
description: BATHTUB_WITH_ENTRY_DESCRIPTION,
reason: BATHTUB_WITH_ENTRY_REASON,
productType: "bathtub_with_entry"
},
    // bathtub_to_shower: {
    //     description: BATHTUB_DESCRIPTION,
    //     reason: BATHTHUB_REASON,
    //     productName: "Badewanne",
    //     productType: "bathtub_to_shower",
    // },
    // shower_to_shower: {
    //     description: SHOWER_DESCRIPTION,
    //     reason: SHOWER_REASON,
    //     productName: "Dusche",
    //     productType: "shower_to_shower",
    // },
    // raised_toilet: {
    //     description: TOILET_DESCRIPTION,
    //     reason: TOILET_REASON,
    //     productName: "WC",
    //     productType: "raised_toilet",
    // },
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

export function getProductDefinitions(productData) {
    let products = {
        description: "",
        reason: ""
    };
    console.log(productData);
    for (const element in productData[0]) {
        const product = productData[0];
        if (element in PRODUCT_CONFIG){
            // console.log(element);
            if (product[element]) {
                products.description += PRODUCT_CONFIG[element].description + " ";
                products.reason += PRODUCT_CONFIG[element].reason + " ";
            }
        }
        // console.log("element:", typeof(productData[0][element]));
        // console.log(productData[0][element]);
    }
    // console.log("getProductDefinitions called with productType:", productType);
    // if (!productType || typeof productType !== 'string') {
    //     console.warn("Invalid productType provided:", productType);
    //     return null;
    // }
    // return PRODUCT_CONFIG[productType] || null;
    if (products.description === "") return null;
    return products;
}
