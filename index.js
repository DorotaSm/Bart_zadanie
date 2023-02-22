const express = require("express");
const app = express();
var jsonValidator = require("jsonschema").Validator;
const bodyParser = require("body-parser");
const server = http.createServer(app);
const date = require("date-and-time");

const GalleryListSchema = {
    type: "object",
    properties: {
        galleries: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    path: { type: "string" },
                    name: { type: "string" },
                    images: {
                        type: "object",
                        properties: {
                            path: { type: "string" },
                            fullpath: { type: "string" },
                            name: { type: "string" },
                            modified: { type: "string" },
                        },
                        required: ["path", "fullpath", "name"],
                    },
                },
                required: ["path", "name"],
            },
        },
    },
    required: ["galleries"],
    additionalProperties: true,
};

const NewGalleryInsertSchema = {
    // title: "New gallery insert schema",
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1,
        },
    },
    required: ["name"],
    additionalProperties: false,
};

const NewPhotoInsertSchema = {
    type: "object",
    properties: {
        path: { type: "string", minLength: 1 },
        fullpath: { type: "string", minLength: 1 },
        name: { type: "string", minLength: 1 },
        modified: { type: "string" },
    },
    required: ["path", "fullpath", "name"],
};

let galleries = {
    galleries: [
        {
            path: "Wild%20Nature",
            name: "Wild Nature",
        },
        {
            path: "Cars",
            name: "Cars",
        },
        {
            path: "Animals",
            name: "Animals",

            images: [
                {
                    path: "elephant.jpg",
                    fullpath: "Animals/elephant.jpg",
                    name: "Elephant",
                    modified: "2017-04-19T08:11:00.0+0200",
                },
                {
                    path: "lion.jpg",
                    fullpath: "Animals/lion.jpg",
                    name: "Lion",
                    modified: "2017-04-19T08:11:32.0+0200",
                },
            ],
        },
    ],
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var validator = new jsonValidator();
validator.addSchema(GalleryListSchema);
validator.addSchema(NewGalleryInsertSchema);

app.get("/gallery", (req, res) => {
    try {
        res.status(200).send(galleries);
    } catch (error) {
        res.status(500).send("Unknown error");
    }
});

app.post("/gallery", (req, res) => {
    const arrayLength = galleries.galleries.length - 1;
    const newGallery = req.body.name;

    try {
        validator.validate(req.body, NewGalleryInsertSchema, {
            throwError: true,
        });
        for (const idx in galleries.galleries) {
            if (newGallery === galleries.galleries[idx].name) {
                return res.status(409).send("Gallery with this name already exists");
            }
            if (Number(idx) === arrayLength) {
                galleries.galleries.push({
                    path: req.body.name,
                    name: req.body.name,
                });
                return res.status(201).send("Gallery was created");
            }
        }
    } catch (error) {
        res
            .status(400)
            .end(
                "Invalid request. The request doesn't conform to the schema. " +
                error.message
            );
    }
});

app.get("/gallery/:galleryName", (req, res) => {
    try {
        const galleryName = req.params.galleryName;
        const arrayLength = galleries.galleries.length - 1;
        if (galleryName === undefined) {
            res.status(500).send("Unknown error");
        }
        for (const idx in galleries.galleries) {
            if (galleryName === galleries.galleries[idx].name) {
                return res.status(200).send(galleries.galleries[idx]);
            }
            if (Number(idx) === arrayLength) {
                return res.status(404).send("Gallery does not exists");
            }
        }
    } catch (error) {
        res.status(500).send("Unknown error");
    }
});

app.delete("/gallery/:galleryName", (req, res) => {
    try {
        const recordName = req.params.galleryName;
        const arrayLength = galleries.galleries.length - 1;
        if (recordName === undefined) {
            res.status(500).send("Unknown error");
        }

        for (const idx in galleries.galleries) {
            if (recordName === galleries.galleries[idx].name) {
                galleries.galleries.splice(Number(idx), 1);
                return res.status(200).send("Gallery/photo was deleted");
            }
            if (Number(idx) === arrayLength) {
                return res.status(404).send("Gallery/photo does not exists");
            }
        }
    } catch (error) {
        res.status(500).send("Unknown error");
    }
});

app.delete("/gallery/:galleryName/:imageName", (req, res) => {
    const imageName = req.params.imageName;
    const recordName = req.params.galleryName;
    const arrayLength = galleries.galleries.length - 1;

    try {
        for (const idx in galleries.galleries) {
            if (recordName === galleries.galleries[idx].name) {
                if (galleries.galleries[idx].images !== undefined) {
                    for (const index in galleries.galleries[idx].images) {
                        if (imageName === galleries.galleries[idx].images[index].path) {
                            galleries.galleries[idx].images.splice(Number(index), 1);
                            return res.status(200).send("Gallery/photo was deleted");
                            // code = 200;
                            // msqContent = "Gallery/photo was deleted";
                            // break;
                        }
                        if (Number(index) === galleries.galleries[idx].images.length - 1) {
                            return res.status(404).send("Gallery/photo does not exists");
                            // code = 404;
                            // msqContent = "Gallery/photo does not exists";
                            // break;
                        }
                    }
                    // break;
                }
            }
            if (Number(idx) === arrayLength) {
                return res.status(404).send("Gallery/photo does not exists");
            }
            // code = 404;
            // msqContent = "Gallery/photo does not exists";
        }
    } catch (error) {
        res.status(500).send("Unknown error");
    }
});

app.post("/gallery/:galleryName/:imageName", (req, res) => {
    const recordName = req.params.galleryName;
    let value = date.format(new Date(), "YYYY/MM/DD HH:mm:ss");
    let modified = String(value);
    const arrayLength = galleries.galleries.length - 1;

    let imgs = [
        {
            path: req.body.path,
            fullpath: req.body.fullpath,
            name: req.body.name,
            modified: modified,
        },
    ];

    try {
        validator.validate(req.body, NewPhotoInsertSchema, {
            throwError: true,
        });

        for (const idx in galleries.galleries) {
            if (recordName === galleries.galleries[idx].name) {
                if (galleries.galleries[idx].images !== undefined) {
                    galleries.galleries[idx].images.push({
                        path: req.body.path,
                        fullpath: req.body.fullpath,
                        name: req.body.name,
                        modified: modified,
                    });
                    return res
                        .status(201)
                        .send(galleries.galleries[idx].images.slice(-1));
                } else {
                    galleries.galleries[idx].images = imgs;
                    return res
                        .status(201)
                        .send(galleries.galleries[idx].images.slice(-1));
                }
            }
            if (Number(idx) === arrayLength) {
                return res.status(404).send("Gallery/photo does not exists");
            }
        }
    } catch (error) {
        res.status(400).send("Invalid request - file not found.");
    }
});

app.get("/image/:p/:galleryName/:imageName", (req, res) => {
    try {
        let size = req.params.p;
        let indx = size.search("x");
        const arrayLength = galleries.galleries.length - 1;
        const imageName = req.params.imageName;
        const recordName = req.params.galleryName;

        const width = size.slice(0, Number(indx));
        const height = size.slice(Number(indx) + 1);
        if (
            imageName === undefined ||
            recordName === undefined ||
            width === undefined ||
            height === undefined
        ) {
            return res.status(500).send("The photo preview can't be generated.");
        }

        for (const idx in galleries.galleries) {
            if (recordName === galleries.galleries[idx].name) {
                if (galleries.galleries[idx].images !== undefined) {
                    for (const index in galleries.galleries[idx].images) {
                        if (imageName === galleries.galleries[idx].images[index].path) {
                            return res.status(200).send({
                                "Media type": "image/jpeg",
                                Type: "any",
                            });
                        }
                        if (Number(index) === galleries.galleries[idx].images.length - 1) {
                            return res.status(404).send("Photo not found");
                        }
                    }
                } else {
                    return res.status(404).send("Photo not found");
                }
            }
            if (Number(idx) === arrayLength) {
                return res.status(404).send("Photo not found");
            }
        }
    } catch (error) {
        res.status(500).send("The photo preview can't be generated.");
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
