const assets
      
let html = ""
html += `
  <button id="add-asset-button">Add file</button>
  <input style="display: none" type="file" id="asset-file-input"/>
  `

  for (let key of Object.keys(assets)) {
    let asset = assets[key]
    html += `<div class="asset-entry">
        ${this.get_asset_html(asset)}
        Name: <input class="asset-namor"
        id = "asset-name-${asset.name}" value="${asset.name}">
        <button class="asset-deletor"
            id="asset-delete-${asset.name}">delete</button>
        </div>`
}
let target = this.box

target.html(html)

//$(".asset-namor").off("click") //they get destroyed anyway
//$(".asset-deletor").off("click")

$(".asset-namor").on("keydown paste", function() {
    let master_class = that
    let self = this
    setTimeout( () => {
        let v = $(self).val()
        let id = $(self).prop("id")
        v = master_class.sanitize_asset_name(v)
        $(self).val(v)
    }, 0)
})

$(".asset-namor").on("change", function() {
    let master_class = that
    let self = this
    setTimeout( () => {
        let v = $(self).val()
        let id = $(self).prop("id")
        v = master_class.sanitize_asset_name(v)
        let result = master_class.rename_asset(id.replace("asset-name-", ""), v)
        if (result.error) {
            alert(result.msg)
            master_class.render_assets_view()
        } else {
            master_class.render_assets_view()
        }
    }, 0)
})

$(".asset-deletor").on("click", function() {
    let id = $(this).prop("id")
    let name = id.replace("asset-delete-", "")
    that.destroy_asset(name)
    that.render_assets_view()
})

$("#asset-file-input").on("change", function(e) {
    let file = e.target.files[0]
    let parts = file.type.split("/")
    let type = parts[0]
    let subtype = parts[1]
    let org_name = that.sanitize_asset_name( file.name.split(".")[0] )
    let name = org_name
    let nr = 1 //this way we start with number 2, so we have: cat, cat2 etc.
    while (that.assets[name]) {
        nr += 1
        name = org_name + nr
    }

    if (type !== "image" && type !== "audio") {
        alert("Asset must be image or mp3 audio file.")
        return
    }
    if (type === "audio" && subtype !=="mpeg") {
        alert("Only mp3 is supported for audio.")
        return
    }
    
    var reader = new FileReader()
    reader.onload = function(){
        let data_url = reader.result
        that.add_asset(type, subtype, data_url, name)
        that.render_assets_view()
    }
    reader.readAsDataURL(file)
})

$("#add-asset-button").on("click", function() {
    $('#asset-file-input').trigger("click")
})