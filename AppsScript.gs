// JX4 BACKEND - v18 (Depuración Pro + Sincronización)
// ID de la Hoja: 1tlKOGm6xEiA38g9wlxTVkBkf2O3S-AtI6U0CYMbL08g

var SS_ID = "1tlKOGm6xEiA38g9wlxTVkBkf2O3S-AtI6U0CYMbL08g";

function getSS() {
  try {
    return SpreadsheetApp.openById(SS_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

function getSheetByNameRobust(ss, name) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName().toLowerCase() === name.toLowerCase()) {
      return sheets[i];
    }
  }
  return null;
}

/**
 * Normaliza la entrada de imagen.
 * Prioriza: URLs directas, luego IDs de Drive, luego rutas de AppSheet.
 */
function normalizarImagen(val, appName, tableName) {
  if (!val || typeof val !== 'string' || val.trim() === "" || val.includes("[object")) return "";
  
  var cleanVal = val.trim();

  // 1. Detectar ID de Google Drive en cualquier formato de URL
  var driveMatch = cleanVal.match(/[-\w]{25,}/);
  if (driveMatch && (cleanVal.includes('drive.google.com') || cleanVal.includes('docs.google.com'))) {
    return "https://drive.google.com/uc?export=view&id=" + driveMatch[0];
  }

  // 2. Si es una URL absoluta externa, dejar igual
  if (cleanVal.startsWith('http')) return cleanVal;

  // 3. Ruta relativa de AppSheet (ej: PRODUCTOS_Images/abc.png)
  if (appName && tableName && (cleanVal.includes('/') || cleanVal.includes('.'))) {
    // Limpiamos posibles prefijos que AppSheet a veces inserta
    var fileName = cleanVal.split('/').pop();
    // Reconstruimos la ruta completa si no tiene el prefijo de carpeta
    var fullPath = cleanVal.includes('_Images/') ? cleanVal : tableName + "_Images/" + fileName;
    
    return "https://www.appsheet.com/template/gettablefileurl?appName=" + 
           encodeURIComponent(appName) + 
           "&tableName=" + encodeURIComponent(tableName) + 
           "&fileName=" + encodeURIComponent(fullPath);
  }

  return cleanVal;
}

function doGet(e) {
  var ss = getSS();
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "productos";
  
  try {
    var configSheet = getSheetByNameRobust(ss, "CONFIG");
    var configVals = configSheet ? configSheet.getDataRange().getValues() : [];
    var configObj = {};
    configVals.forEach(function(r) { if (r[0]) configObj[r[0]] = r[1]; });
    
    var appName = configObj.appsheet_app_name || "Jx4-324982005";
    var tableName = configObj.appsheet_table_name || "PRODUCTOS";

    if (action === 'productos') {
      var sheet = getSheetByNameRobust(ss, "PRODUCTOS");
      if (!sheet) throw new Error("Hoja PRODUCTOS no encontrada");
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0].map(function(h) { return h.toString().toLowerCase().trim().replace(/ /g, "_"); });
      
      var products = data.slice(1).map(function(row) {
        var p = {};
        headers.forEach(function(h, i) { p[h] = row[i]; });

        // Identificar columna de imagen dinámicamente
        var rawImg = p.imagenurl_publica || p.imagenurl || p.foto || p.imagen || p.url_imagen || "";
        p.imagen_raw = rawImg; // Para depuración
        p.imagenurl = normalizarImagen(rawImg, appName, tableName);
        
        return p;
      }).filter(function(p) { return p.nombre && String(p.nombre).trim() !== ""; });

      return createJsonResponse({ success: true, data: products, debug: { appName: appName, tableName: tableName } });
    }

    if (action === 'config') {
      return createJsonResponse({ success: true, data: configObj });
    }

    return createJsonResponse({ success: false, error: "Acción desconocida" });

  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}