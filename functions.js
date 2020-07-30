$(document).ready(function () {
    JSONEditor.defaults.options.iconlib = "fontawesome5";
    JSONEditor.defaults.options.theme = "bootstrap3";

    const jsonEditor = $("#json-editor");
    const jsonViewer = $("#json-viewer > pre > code");

    const buttonLoadSchema = $("#load-schema");
    const buttonLoadJSON = $("#load-json");
    const buttonSaveJSON = $("#save-json");

    const inputSchema = $("#schema-file-input");
    const inputJSON = $("#json-file-input");

    let schemaJSON;
    let json;

    let filename;

    let editor;

    $(buttonLoadSchema).click(() => inputSchema.trigger('click'));
    $(inputSchema).change(function (e) {
        loadJSON(e.target.files[0])
            .then(object => schemaJSON = object)
            .then(() => loadEditorAndViewer())
            .catch((err) => { /* TODO: notification */ })
    });

    $(buttonLoadJSON).click(() => inputJSON.trigger('click'));
    $(inputJSON).change(function (e) {
        loadJSON(e.target.files[0])
            .then(object => json = object)
            .then(() => filename = e.target.files[0].name)
            .then(() => loadEditorAndViewer())
            .catch((err) => { /* TODO: notification */ })
    });

    $(buttonSaveJSON).click(function (e) {
        if (editor == null) {
            // TODO: notification
        }

        saveJSON(editor.getValue(), filename)
    });

    function loadEditorAndViewer() {
        if (schemaJSON === undefined || json === undefined) {
            return;
        }

        jsonEditor.empty();

        editor = new JSONEditor(jsonEditor[0], { schema: schemaJSON })

        editor.on('ready', () => {
            editor.validate();
            editor.setValue(json);
        });

        editor.on('change', () => {
            $(jsonViewer).text(JSON.stringify(editor.getValue(), null, 4));
            hljs.highlightBlock(jsonViewer[0]);
        });
    }
});

function loadJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = err => reject(err);
        reader.readAsText(file);
    }).then(content => JSON.parse(content));
}

function saveJSON(json, filename) {
    const content = JSON.stringify(json, null, 4);
    const a = document.createElement("a");
    const file = new Blob([content], { type: "application/json" });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
}