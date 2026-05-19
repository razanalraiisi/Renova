import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

let model = null;


const loadModel = async () => {

  if (!model) {

    model =
      await mobilenet.load();

    console.log(
      "MobileNet loaded successfully"
    );
  }

  return model;
};


const electronicsMap = {

  Laptop: [
    "laptop",
    "notebook",
  ],

  Phone: [
    "cellular telephone",
    "mobile phone",
    "smartphone",
    "iphone",
    "ipod",
  ],

  Tablet: [
    "tablet",
    "ipad",
  ],

  PSP: [
    "hand-held computer",
    "handheld computer",
    "game console",
  ],

  Console: [
    "console",
    "playstation",
    "xbox",
    "nintendo",
  ],

  Keyboard: [
    "keyboard",
  ],

  Mouse: [
    "mouse",
  ],

  Monitor: [
    "monitor",
    "screen",
  ],

  TV: [
    "television",
    "tv",
  ],

  Camera: [
    "reflex camera",
    "camera",
    "digital camera",
    "webcam",
  ],

  Headphones: [
    "headphone",
    "headset",
    "earphone",
    "earbuds",
  ],

  Speaker: [
    "speaker",
    "loudspeaker",
  ],

  Printer: [
    "printer",
  ],

  "Remote Control": [
    "remote control",
  ],

  "Hair Dryer": [
    "hand blower",
    "hair dryer",
    "blow dryer",
  ],

  "Coffee Maker": [
    "coffee maker",
    "espresso maker",
  ],

  Microwave: [
    "microwave",
  ],

  Refrigerator: [
    "refrigerator",
    "fridge",
  ],

  "Washing Machine": [
    "washer",
    "washing machine",
  ],

  "Vacuum Cleaner": [
    "vacuum",
    "vacuum cleaner",
  ],

  Joystick: [
    "joystick",
    "game controller",
  ],
};


const bannedObjects = [

  "wallet",
  "purse",
  "lens cap",
  "can opener",
  "stove",
  "plate",
  "spoon",
  "fork",
  "shoe",
  "bag",
  "backpack",
  "book",
  "cup",
  "bottle",
  "food",
  "banana",
  "orange",
  "dog",
  "cat",
  "person",
];


const detectElectronic =
  (predictions) => {

    for (
      const prediction
      of predictions
    ) {

      const rawLabel =
        prediction.className
          .toLowerCase();

      const confidence =
        prediction.probability * 100;

      
      if (confidence < 20) {
        continue;
      }

      
      const isBanned =
        bannedObjects.some(
          (bad) =>
            rawLabel.includes(bad)
        );

      if (isBanned) {
        continue;
      }

      
      for (
        const device
        in electronicsMap
      ) {

        const keywords =
          electronicsMap[device];

        const matched =
          keywords.some(
            (keyword) =>
              rawLabel.includes(
                keyword
              )
          );

        if (matched) {

          return {
            detectedDevice:
              device,

            confidence:
              confidence.toFixed(2),
          };
        }
      }

      
      return {

        detectedDevice:
          prediction.className
            .split(",")[0]
            .replace(/_/g, " ")
            .replace(
              /\b\w/g,
              (char) =>
                char.toUpperCase()
            ),

        confidence:
          confidence.toFixed(2),
      };
    }

    return {

      detectedDevice:
        "Unknown Electronic Device",

      confidence: "0",
    };
};


const getRecommendation =
  (condition) => {

    switch (condition) {

      case "working":
        return "Upcycle";

      case "damaged":
        return "Recycle";

      case "dangerous":
        return "Dispose";

      default:
        return "Recycle";
    }
};


export const getAIRecommendation =
  async (
    imageFile,
    condition
  ) => {

    try {

      const loadedModel =
        await loadModel();

      // Create image
      const img =
        document.createElement(
          "img"
        );

      img.src =
        URL.createObjectURL(
          imageFile
        );

      
      await new Promise(
        (resolve) => {

          img.onload =
            resolve;
        }
      );

      
      const predictions =
        await loadedModel.classify(
          img
        );

      console.log(
        "Predictions:",
        predictions
      );

      
      const result =
        detectElectronic(
          predictions
        );

      return {

        recommendation:
          getRecommendation(
            condition
          ),

        detectedDevice:
          result.detectedDevice,

        confidence:
          result.confidence,
      };

    } catch (error) {

      console.error(
        "AI Error:",
        error
      );

      return {

        recommendation:
          "Recycle",

        detectedDevice:
          "Unknown Electronic Device",

        confidence: "0",
      };
    }
};