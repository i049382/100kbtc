import sharp from "sharp";

import axios from "axios";

import fs from "fs";

import path from "path";

export default {

name: "Generate Confession Image", // The name of the component

version: "0.0.6", // Versioning

key: "generate_confession_image",

description: "Generates an image with a confession overlayed on a template and saves it to /tmp.",

type: "action", // Define as an action

props: {

confessionText: {

type: "string",

label: "Confession Text",

description: "The anonymous confession text to overlay on the image.",

},

imageTemplate: {

type: "string",

label: "Image Template URL",

description: "URL of the template image you want to use as a background.",

},

},

async run({ steps, $ }) {

// Fetch the image template from a URL

const response = await axios.get(this.imageTemplate, {

responseType: "arraybuffer",

});

const imageBuffer = Buffer.from(response.data, "binary");

// Fetch image dimensions

const imageMetadata = await sharp(imageBuffer).metadata();

console.log("Image dimensions:", imageMetadata.width, "x", imageMetadata.height);

// Calculate dimensions for the text box
const topPadding = 130; // Height of items at the top
const bottomPadding = 250; // Height of items at the bottom
const sidePadding = 80; // Padding on the sides

const textBoxWidth = imageMetadata.width - (sidePadding * 2);
const textBoxHeight = imageMetadata.height - topPadding - bottomPadding;

// Prepare the text
const fontSize = 72; // A reasonably large font size
console.log("Font size:", fontSize);

// Use sharp to composite the image and text
const outputBuffer = await sharp(imageBuffer)
.composite([
{
input: {
text: {
text: this.confessionText,
font: "Arial",
fontSize: fontSize,
width: textBoxWidth,
height: textBoxHeight,
align: 'center',
rgba: true,
background: { r: 0, g: 0, b: 0, alpha: 0.6 },
color: '#ffffff'
}
},
top: topPadding,
left: sidePadding
}
])
.toBuffer();

// Define the file path to save the image in the /tmp directory

const filePath = path.join("/tmp", "confession-image.png");

// Write the image buffer to the file

fs.writeFileSync(filePath, outputBuffer);

// Export the file path

$.export("filePath", filePath);

return {

message: "Confession image created and saved to /tmp successfully!",

filePath,

};

}

};
