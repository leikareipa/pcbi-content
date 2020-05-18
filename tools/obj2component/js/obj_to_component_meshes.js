/*
 * 2020 Tarpeeksi Hyvae Soft
 *
 * Software: PCbi / tools / converter / obj2component
 * 
 */

"use strict";

// Converts the given Wavefront OBJ file (given as a pair of File objects, one for the
// actual OBJ file and the other for its accompanying MTL file) into PCbi's mesh format.
// Returns a Promise that resolves on success to an array of the following format:
//
// [
//     Array: the converted meshes as strings,
//     Array: a list of the unique texture names in the mesh,
//     Array: the convertex meshes as retro n-gon renderer n-gons
// ]
//
function convert_obj_to_component_meshes(objFile, mtlFile)
{
    return new Promise((resolve, reject)=>
    {
        const meshes = [];
        const rngonPolys = [];

        const objFileReader = new FileReader();
        const mtlFileReader = new FileReader();

        // First, we load in the MTL file's contents, then we parse the OBJ file
        // to convert its contents into PCbi meshes.
        mtlFileReader.onloadend = ()=>
        {
            const materials = mtlFileReader.result.split("\nnewmtl").slice(1);

            objFileReader.onloadend = ()=>
            {
                let uvs = [];
                let normals = [];
                let vertices = [];
                const textureNames = new Set();
                const objects = objFileReader.result.split("\no ").slice(1);

                for (const object of objects)
                {
                    let meshString = "";

                    vertices = [...vertices, ...object.split("\n").filter(line=>line.startsWith("v "))];
                    uvs      = [...uvs,      ...object.split("\n").filter(line=>line.startsWith("vt "))];
                    normals  = [...normals,  ...object.split("\n").filter(line=>line.startsWith("v "))];

                    const faceGroups = object.split("\nusemtl").slice(1);

                    meshString += `mesh,{${object.split("\n")[0]}},${object.split("\n").filter(line=>line.startsWith("f ")).length}\n`;

                    // Each face group is a set of one or more faces sharing
                    // a material.
                    for (const faceGroup of faceGroups)
                    {
                        const materialName  = (faceGroup.split("\n")[0] || null);
                        const material      = (materials.filter(material=>(material.startsWith(materialName)))[0] || null);
                        const materialKd    = (material.split("\n").filter(line=>line.startsWith("Kd "))[0] || null);
                        const materialMapKd = (material.split("\n").filter(line=>line.startsWith("map_Kd "))[0] || null);
                        const faces         = (faceGroup.split("\n").filter(line=>line.startsWith("f ")) || null);

                        if ((materialName === null) ||
                            (materialKd   === null) ||
                            (material     === null) ||
                            (faces        === null))
                        {
                            reject("Invalid or unsupported mesh data.");
                            return;
                        }

                        const color = materialKd.split(" ").slice(1);
                        const textureName = ((materialMapKd === null)
                                            ? ""
                                            : (materialMapKd.split(" ")[1].slice(materialMapKd.split(" ")[1].replace(/\\/g, "/").lastIndexOf("/") + 1)));

                        if (color.length != 3)
                        {
                            reject("Invalid MTL file: malformed 'Kd' entry, expected 3 values.");
                            return;
                        }

                        if (textureName === null)
                        {
                            reject("Invalid MTL file: malformed 'map_Kd' entry.");
                            return;
                        }

                        if (textureName.length)
                        {
                            textureNames.add(textureName);
                        }

                        for (const face of faces)
                        {
                            const indicesList = face.split(" ").slice(1);

                            meshString += `polygon,${indicesList.length}\n`;
                            meshString += `material,${Math.floor(color[0]*255)},${Math.floor(color[1]*255)},${Math.floor(color[2]*255)},255,{${textureName}}\n`;

                            const rngonVerts = [];

                            for (const indices of indicesList)
                            {
                                // [0]: vertex index, [1]: uv index, [2]: normals index.
                                const index = indices.split("/");

                                const vertexCoords = vertices[index[0] - 1].split(" ").slice(1);
                                const uvCoords = ((uvs[index[1] - 1] || "vt 0.000000 0.000000").split(" ").slice(1));
                                
                                vertexCoords[0] = -Number(vertexCoords[0]);

                                const vertexCoordString = vertexCoords.join(",");
                                const uvString = uvCoords.join(",");

                                rngonVerts.push(Rngon.vertex(Number(vertexCoords[0]),
                                                             Number(vertexCoords[1]),
                                                             Number(vertexCoords[2]),
                                                             Number(uvCoords[0]),
                                                             -Number(uvCoords[1])));

                                meshString += `vertex,${vertexCoordString},${uvString}\n`;
                            }

                            rngonPolys.push(Rngon.ngon(rngonVerts,
                            {
                                color: (textureName.length
                                        ? Rngon.color_rgba(255, 255, 255)
                                        : Rngon.color_rgba(Math.floor(color[0]*255), Math.floor(color[1]*255), Math.floor(color[2]*255))),
                                textureName: textureName,
                                textureMapping: "affine",
                                uvWrapping: "repeat"
                            }));
                        }
                    }

                    meshes.push(meshString.trim());
                }

                resolve([meshes, [...textureNames], rngonPolys]);
                return;
            };

            objFileReader.readAsText(objFile);
        };

        mtlFileReader.readAsText(mtlFile);
    });
}
