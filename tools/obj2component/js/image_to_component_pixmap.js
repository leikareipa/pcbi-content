/*
 * 2020 Tarpeeksi Hyvae Soft
 *
 * Software: PCbi / tools / converter / obj2component
 * 
 */

"use strict";

// Converts the given image file (a File object) into PCbi's pixmap format. Returns the
// converted pixmap as a string.
//
// [
//     String: the converted pixmap as a string,
//     Rngon.texture_rgba: the image as a retro n-gon renderer texture
// ]
//
function convert_image_to_component_pixmap(imageFile)
{
    return new Promise((resolve, reject)=>
    {
        let pixmap = "pixmap";
        const canvas = document.createElement("canvas");
        const fileReader = new FileReader();

        pixmap += `,{${imageFile.name}}`;

        fileReader.onloadend = ()=>
        {
            const image = new Image();

            image.onload = ()=>
            {
                const context = canvas.getContext("2d");

                canvas.setAttribute("width", image.width);
                canvas.setAttribute("height", image.height);
                canvas.getContext('2d').drawImage(image, 0, 0, image.width, image.height);

                pixmap += `,${image.width},${image.height}`;

                const pixelsArray = [];

                for (let y = 0; y < image.height; y++)
                {
                    for (let x = 0; x < image.width; x++)
                    {
                        const pixel = context.getImageData(x, (image.height - y - 1), 1, 1).data;
                        const u16Pixel = (((pixel[0] / 8) << 0)  |
                                          ((pixel[1] / 8) << 5)  |
                                          ((pixel[2] / 8) << 10) |
                                          (1              << 15)); // Alpha is always fully opaque, for now.

                        pixmap += `,${u16Pixel.toString(16)}`;

                        pixelsArray.push(pixel[0], pixel[1], pixel[2], 255);
                    }
                }

                const rngonTexture = Rngon.texture_rgba(
                {
                    width: image.width,
                    height: image.height,
                    pixels: pixelsArray,
                });

                resolve([pixmap, rngonTexture]);
            };

            image.src = fileReader.result;
        };

        fileReader.readAsDataURL(imageFile);
    });
}