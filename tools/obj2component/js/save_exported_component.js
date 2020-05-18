/*
 * 2020 Tarpeeksi Hyvae Soft
 *
 * Software: PCbi / tools / converter / obj2component
 * 
 */

"use strict";

function save_exported_component()
{
    let fileContents = "";

    const componentFilename = document.getElementById("component-name")
                              .value.replace(/[^\w]/g, "_").toLowerCase()
                              + ".component";

    const pcbiParams = document.getElementById("component-params")
                       .value.split(",").map(text=>`{${text.trim()}}`);

    const pcemConfig = document.getElementById("component-pcem-config")
                       .value.split(",").map(text=>`{${text.trim()}}`);

    const pcemConfigExtra = document.getElementById("component-pcem-config-extra")
                           .value.split(",").map(text=>`{${text.trim()}}`);

    fileContents += "fileType,{PCbi component}\n";
    fileContents += "fileFormatVersion,1\n\n";

    fileContents += `name,{${document.getElementById("component-name").value}}\n`;
    fileContents += `type,{${document.getElementById("component-type").value}}\n`;
    fileContents += `params,${pcbiParams.join(",")}\n`;
    fileContents += `pcemConfig,${pcemConfig.join(",")}\n`;
    fileContents += `pcemConfigExtra,${pcemConfigExtra.join(",")}\n`;
    fileContents += `uuid,{${document.getElementById("component-uuid").value}}\n\n`;

    fileContents += `pixmaps,${Object.values(convertedPixmaps).length}\n`;
    fileContents += `${Object.values(convertedPixmaps).join("\n")}\n\n`;
    
    fileContents += `meshes,${convertedMeshes.length}\n`;
    fileContents += `${convertedMeshes.join("\n")}\n`;

    saveAs(new Blob([fileContents], {type: "text/plain;charset=utf-8"}), componentFilename);

    return;
}
