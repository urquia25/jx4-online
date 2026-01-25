/**
 * JX4 PARACOTOS - SISTEMA DEFINITIVO v10.1.2
 * Versión completamente corregida - ERRORES RESUELTOS
 * Sistema de pedidos multi-departamento con validación y envío a WhatsApp
 */

// ==================== CONFIGURACIÓN GLOBAL ====================
var SS_ID = "1tlKOGm6xEiA38g9wlxTVkBkf2O3S-AtI6U0CYMbL08g";
var SUPABASE_URL = "https://dpnpnqnvfkwipmgyphmx.supabase.co";
var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwbnBucW52Zmt3aXBtZ3lwaG14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODk3NTYsImV4cCI6MjA4NDU2NTc1Nn0.lxGo8CLyhGdBxHgnn8topqy1nPtxTKmaspTZ-G9Sde8";

// ==================== 1. FUNCIÓN DE RESPUESTA SIMPLIFICADA ====================

function createResponse(data, statusCode) {
  statusCode = statusCode || 200;
  
  var response = {
    success: statusCode >= 200 && statusCode < 300,
    code: statusCode,
    timestamp: new Date().toISOString(),
    data: data
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// ==================== 2. FUNCIÓN PRINCIPAL DOGET ====================

function doGet(e) {
  try {
    var params = e ? e.parameter : {};
    var action = (params.action || "status").toLowerCase();
    
    var responseData;
    
    switch(action) {
      case "ping":
        responseData = { 
          status: "pong", 
          app: "JX4 v10.1.2", 
          timestamp: new Date().toISOString() 
        };
        break;
      
      case "status":
        responseData = {
          status: "online",
          app: "JX4 Paracotos",
          version: "10.1.2",
          timestamp: new Date().toISOString(),
          actions: ["ping", "status", "all_data", "productos", "departamentos", "config", "cintillo", "test", "buscar_cliente", "procesar_imagenes_pendientes", "validar_carrito"]
        };
        break;
      
      case "all_data":
        responseData = getAllData();
        break;
      
      case "productos":
        responseData = getProductos();
        break;
      
      case "departamentos":
        responseData = getDepartamentos();
        break;
      
      case "config":
        responseData = getConfig();
        break;
      
      case "cintillo":
        responseData = getCintillo();
        break;
      
      case "buscar_cliente":
        if (params.telefono) {
          responseData = searchCustomer(params.telefono);
        } else {
          return createResponse({ error: "Parámetro 'telefono' requerido" }, 400);
        }
        break;
        
      case "validar_carrito":
        if (params.productos) {
          try {
            var productos = JSON.parse(params.productos);
            responseData = validarCarrito(productos);
          } catch (e) {
            return createResponse({ 
              error: "Error parseando productos", 
              detalles: e.toString() 
            }, 400);
          }
        } else {
          return createResponse({ error: "Parámetro 'productos' requerido" }, 400);
        }
        break;
        
      case "test":
        responseData = testConnection();
        break;
        
      case "procesar_imagenes_pendientes":
        responseData = procesarImagenesPendientes();
        break;
        
      default:
        return createResponse({ 
          error: "Acción no válida", 
          action: action,
          acciones_validas: ["ping", "status", "all_data", "productos", "departamentos", "config", "cintillo", "test", "buscar_cliente", "procesar_imagenes_pendientes", "validar_carrito"]
        }, 400);
    }
    
    return createResponse(responseData);
    
  } catch (error) {
    console.error("Error en doGet:", error);
    return createResponse({ 
      error: "Error interno del servidor", 
      detalles: error.toString(),
      stack: error.stack 
    }, 500);
  }
}

// ==================== 3. FUNCIÓN PRINCIPAL DOPOST ====================

function doPost(e) {
  try {
    // VALIDACIÓN CRÍTICA: Verificar que 'e' existe
    if (!e) {
      return createResponse({ 
        error: "No se recibió la solicitud", 
        action: "unknown" 
      }, 400);
    }
    
    // Inicializar datos
    var data = {};
    var rawData = {};
    
    // Manejar diferentes tipos de entrada
    if (e.postData) {
      var contentType = e.postData.type || "application/json";
      var contents = e.postData.contents || "{}";
      
      if (contentType.includes("application/json")) {
        // JSON directo
        try {
          data = JSON.parse(contents);
        } catch (parseError) {
          console.error("Error parseando JSON:", parseError);
          return createResponse({ 
            error: "Error en formato JSON", 
            detalles: parseError.toString() 
          }, 400);
        }
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        // Formulario codificado
        var params = contents.split('&');
        params.forEach(function(param) {
          var pair = param.split('=');
          if (pair.length === 2) {
            var key = decodeURIComponent(pair[0]);
            var value = decodeURIComponent(pair[1]);
            
            // Si la clave es 'data', intentar parsear como JSON
            if (key === 'data') {
              try {
                data = JSON.parse(value);
              } catch (e) {
                console.warn("No se pudo parsear 'data' como JSON, usando como string");
                data = { raw: value };
              }
            } else {
              rawData[key] = value;
            }
          }
        });
        
        // Si no se encontró 'data', usar rawData
        if (Object.keys(data).length === 0 && Object.keys(rawData).length > 0) {
          data = rawData;
        }
      }
    }
    
    // Si aún no hay datos, verificar parameters
    if (Object.keys(data).length === 0 && e.parameter) {
      data = e.parameter;
    }
    
    // Verificar que tenemos una acción
    if (!data.action) {
      return createResponse({ 
        error: "Parámetro 'action' requerido" 
      }, 400);
    }
    
    var action = data.action;
    var response;
    
    // Procesar acciones
    switch(action) {
      case "crear_pedido":
        response = createOrder(data);
        break;
      
      case "actualizar_tasa":
        response = updateTasa(data.tasa);
        break;
      
      case "actualizar_config":
        response = updateConfig(data.clave, data.valor);
        break;
        
      case "registrar_cliente":
        response = registerCustomer(data);
        break;

      case "procesar_imagen":
        if (data.id && data.imagen) {
          response = procesarImagenDesdeAppSheet(data.id, data.imagen);
        } else {
          response = { error: "Parámetros 'id' e 'imagen' requeridos" };
        }
        break;
        
      case "validar_carrito":
        var productos = data.productos;
        if (typeof productos === 'string') {
          try {
            productos = JSON.parse(productos);
          } catch (e) {
            return createResponse({ 
              error: "Error parseando productos", 
              detalles: e.toString() 
            }, 400);
          }
        }
        response = validarCarrito(productos);
        break;
        
      default:
        response = { 
          error: "Acción POST no válida", 
          action: action,
          acciones_validas: [
            "crear_pedido", "actualizar_tasa", "actualizar_config",
            "registrar_cliente", "procesar_imagen", "validar_carrito"
          ]
        };
    }
    
    return createResponse(response);
    
  } catch (error) {
    console.error("Error en doPost:", error);
    return createResponse({ 
      error: "Error interno del servidor", 
      detalles: error.toString(),
      stack: error.stack 
    }, 500);
  }
}

// ==================== 4. FUNCIÓN PARA OBTENER TODOS LOS DATOS ====================

function getAllData() {
  try {
    var config = getConfig().data;
    var tasa = parseFloat(config.tasa_cambio) || 36.5;
    
    return {
      productos: getProductosList(),
      departamentos: getDepartamentos().data || [],
      config: config,
      cintillo: getCintillo().data || [],
      tasa_cambio: tasa
    };
    
  } catch (error) {
    console.error("Error en getAllData:", error);
    return {
      productos: [],
      departamentos: [],
      config: {},
      cintillo: [],
      tasa_cambio: 36.5,
      error: error.toString()
    };
  }
}

// ==================== 5. FUNCIÓN PARA LEER DATOS DE HOJAS ====================

function getSheetDataArray(name) {
  try {
    var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName(name);
    if (!sheet) {
      console.log("Hoja '" + name + "' no encontrada");
      return [];
    }
    
    var vals = sheet.getDataRange().getValues();
    if (vals.length < 2) {
      return [];
    }
    
    var headers = vals[0];
    var data = [];
    
    for (var i = 1; i < vals.length; i++) {
      var row = vals[i];
      var obj = {};
      var hasData = false;
      
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        if (header !== null && header !== undefined && header !== "") {
          var value = row[j];
          if (value !== null && value !== undefined && value !== "") {
            obj[header] = value;
            hasData = true;
          }
        }
      }
      
      if (hasData) {
        data.push(obj);
      }
    }
    
    return data;
  } catch (error) {
    console.error("Error en getSheetDataArray para '" + name + "':", error);
    return [];
  }
}

// ==================== 6. FUNCIONES PARA PRODUCTOS ====================

function getProductos() {
  try {
    var productos = getProductosList();
    return { success: true, count: productos.length, data: productos };
  } catch (error) {
    return { success: false, error: error.toString(), data: [] };
  }
}

function getProductosList() {
  try {
    var data = getSheetDataArray("PRODUCTOS");
    
    return data.map(function(p) {
      // Procesar imagen manteniendo la lógica original
      var img = p.ImagenURL_Publica || p.ImagenURL || p.imagenurl || "";
      
      // Convertir enlaces de Google Drive a enlaces directos
      if (img && img.includes("drive.google.com")) {
        var idMatch = img.match(/\/d\/([^\/]+)/);
        if (idMatch && idMatch[1]) {
          img = "https://drive.google.com/uc?export=view&id=" + idMatch[1];
        }
      }
      
      // Si no hay imagen, usar iniciales como fallback
      if (!img || img === "") {
        var nombre = p.NOMBRE || p.nombre || "";
        img = "https://ui-avatars.com/api/?name=" + 
              encodeURIComponent(nombre.substring(0, 2)) + 
              "&background=3d4a3e&color=fff&size=150";
      }
      
      return {
        id: p.ID || p.id || "",
        nombre: p.NOMBRE || p.nombre || "",
        precio: parseFloat(p.PRECIO || p.precio) || 0,
        categoria: p.CATEGORIA || p.categoria || "General",
        departamento: p.DEPARTAMENTO || p.departamento || "General",
        descripcion: p.DESCRIPCION || p.descripcion || "",
        imagenurl: img,
        disponible: (p.ACTIVO === "SI" || p.ACTIVO === true || p.activo === "SI" || p.activo === true || p.disponible === true),
        unidad: p.UNIDAD || p.unidad || "und"
      };
    }).filter(function(p) { 
      return p.nombre && p.precio > 0; 
    });
    
  } catch (error) {
    console.error("Error en getProductosList:", error);
    return [];
  }
}

// ==================== 7. FUNCIÓN syncOrderToSupabase CORREGIDA ====================

function syncOrderToSupabase(order) {
  try {
    // VALIDACIÓN EXHAUSTIVA
    if (!order || typeof order !== 'object') {
      console.error("Error: order es null, undefined o no es objeto");
      return { 
        success: false, 
        error: "Datos del pedido no válidos",
        order_received: order 
      };
    }
    
    // Validar campos críticos
    var requiredFields = ['id_pedido', 'telefono_cliente', 'nombre_cliente'];
    var missingFields = [];
    
    requiredFields.forEach(function(field) {
      if (!order[field]) {
        missingFields.push(field);
      }
    });
    
    if (missingFields.length > 0) {
      console.error("Error: Campos requeridos faltantes:", missingFields);
      return { 
        success: false, 
        error: "Campos requeridos faltantes: " + missingFields.join(", "),
        missing_fields: missingFields 
      };
    }
    
    // Validar Supabase
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.log("Supabase no configurado, sincronización omitida");
      return { 
        success: false, 
        error: "Supabase no configurado",
        skipped: true 
      };
    }
    
    // Preparar payload
    var payload = {
      id_pedido: order.id_pedido || "",
      telefono_cliente: order.telefono_cliente || "",
      nombre_cliente: order.nombre_cliente || "",
      direccion_entrega: order.direccion_entrega || "",
      productos: Array.isArray(order.productos) ? order.productos : [],
      total: typeof order.total === 'number' ? order.total : 0,
      metodo_pago: order.metodo_pago || "efectivo",
      notas: order.notas || "",
      estado: order.estado || "PENDIENTE",
      fecha_pedido: order.fecha_pedido || new Date().toISOString(),
      departamento: order.departamento || "General",
      fecha_sync: new Date().toISOString()
    };
    
    // Configurar opciones
    var options = {
      'method': 'post',
      'headers': {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Prefer': 'return=minimal'
      },
      'payload': JSON.stringify(payload),
      'muteHttpExceptions': true
    };
    
    // Enviar a Supabase
    var url = SUPABASE_URL + '/rest/v1/pedidos';
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    if (statusCode >= 200 && statusCode < 300) {
      console.log("✅ Pedido sincronizado con Supabase:", order.id_pedido);
      return { 
        success: true, 
        id_pedido: order.id_pedido,
        status: statusCode 
      };
    } else {
      console.error("❌ Error sincronizando con Supabase:", statusCode, responseText);
      return { 
        success: false, 
        error: "HTTP " + statusCode,
        respuesta: responseText,
        payload: payload 
      };
    }
    
  } catch (error) {
    console.error("❌ Excepción en syncOrderToSupabase:", error);
    return { 
      success: false, 
      error: "Excepción: " + error.toString(),
      stack: error.stack 
    };
  }
}

// ==================== 8. FUNCIÓN PARA GENERAR MENSAJE WHATSAPP ====================

function generarMensajeWhatsApp(orderData, departamento, codigoPedido) {
  try {
    // Validar parámetros
    if (!orderData) {
      return "❌ ERROR: No se recibieron datos del pedido";
    }
    
    departamento = departamento || "General";
    codigoPedido = codigoPedido || "SIN-CODIGO";
    
    var productosLista = "";
    if (orderData.productos && Array.isArray(orderData.productos) && orderData.productos.length > 0) {
      productosLista = orderData.productos.map(function(p) {
        var nombre = p.nombre || "Producto sin nombre";
        var precio = parseFloat(p.precio) || 0;
        var cantidad = parseFloat(p.quantity) || 1;
        var unidad = p.unidad || "und";
        var subtotal = (precio * cantidad).toFixed(2);
        return "• " + nombre + ": " + cantidad + " " + unidad + " (Bs. " + subtotal + ")";
      }).join('\n');
    } else {
      productosLista = "• No hay productos detallados";
    }
    
    var fecha = new Date();
    var fechaFormateada = fecha.toLocaleDateString('es-VE');
    var horaFormateada = fecha.toLocaleTimeString('es-VE');
    
    return "🚨 *NUEVO PEDIDO - " + departamento.toUpperCase() + "*\n" +
           "---------------------------------\n" +
           "*Código:* " + codigoPedido + "\n" +
           "*Fecha:* " + fechaFormateada + " " + horaFormateada + "\n" +
           "---------------------------------\n" +
           "*Cliente:* " + (orderData.nombre || "No especificado") + "\n" +
           "*Teléfono:* " + (orderData.telefono || "No especificado") + "\n" +
           "*Dirección:* " + (orderData.direccion || "Por confirmar") + "\n" +
           "---------------------------------\n" +
           "*Detalle del Pedido:*\n" +
           productosLista + "\n" +
           "---------------------------------\n" +
           "*Total:* Bs. " + (parseFloat(orderData.total) || 0).toFixed(2) + "\n" +
           "*Método de Pago:* " + (orderData.metodo_pago || "efectivo") + "\n" +
           "*Notas:* " + (orderData.notas || "Ninguna") + "\n" +
           "---------------------------------\n" +
           "🕐 *Pedido generado automáticamente desde la web JX4 Paracotos.*\n" +
           "📞 *Por favor contactar al cliente para confirmar disponibilidad y coordinar entrega.*";
  } catch (error) {
    console.error("Error en generarMensajeWhatsApp:", error);
    return "❌ ERROR generando mensaje: " + error.toString();
  }
}

// ==================== 9. FUNCIÓN PARA CREAR PEDIDO ====================

function createOrder(orderData) {
  try {
    // Validar datos básicos
    if (!orderData) {
      return { 
        success: false, 
        error: "Datos del pedido no proporcionados" 
      };
    }
    
    if (!orderData.telefono || !orderData.nombre) {
      return { 
        success: false, 
        error: "Teléfono y nombre son requeridos" 
      };
    }
    
    // 1. Validar carrito
    var validacion = validarCarrito(orderData.productos || []);
    if (!validacion.valido) {
      return { 
        success: false, 
        error: validacion.mensaje || "Carrito inválido" 
      };
    }
    
    // 2. Registrar/actualizar cliente
    var registroCliente = registerCustomer({
      telefono: orderData.telefono,
      nombre: orderData.nombre,
      direccion: orderData.direccion || "",
      email: orderData.email || ""
    });
    
    if (!registroCliente.success) {
      console.warn("Error registrando cliente:", registroCliente.error);
    }
    
    // 3. Determinar departamento y WhatsApp destino
    var departamentoPedido = validacion.departamento || "General";
    var departamentos = getDepartamentos().data || [];
    var config = getConfig().data;
    
    // Buscar WhatsApp del departamento
    var deptInfo = null;
    for (var i = 0; i < departamentos.length; i++) {
      if (departamentos[i].nombre === departamentoPedido) {
        deptInfo = departamentos[i];
        break;
      }
    }
    
    var whatsappDestino = (deptInfo && deptInfo.telefono) 
      ? deptInfo.telefono 
      : config.whatsapp_coordinador || config.whatsapp_principal || "584241208234";
    
    // 4. Generar código único para el pedido
    var orderId = "PED-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    var now = new Date();
    var fechaISO = now.toISOString();
    
    // 5. Preparar datos del pedido para guardar
    var productosStr = "";
    if (orderData.productos && orderData.productos.length > 0) {
      productosStr = orderData.productos.map(function(p) {
        var cantidad = p.quantity || 1;
        var unidad = p.unidad || "und";
        return p.nombre + " (" + cantidad + " " + unidad + ")";
      }).join(" | ");
    }
    
    // 6. Guardar pedido en Google Sheets
    var ss = SpreadsheetApp.openById(SS_ID);
    var sheet = ss.getSheetByName("PEDIDOS");
    
    if (!sheet) {
      // Crear hoja PEDIDOS
      sheet = ss.insertSheet("PEDIDOS");
      sheet.getRange(1, 1, 1, 13).setValues([[
        "ID_PEDIDO", "FECHA", "TELEFONO", "NOMBRE", 
        "DIRECCION", "DEPARTAMENTO", "PRODUCTOS", "TOTAL", 
        "METODO_PAGO", "NOTAS", "ESTADO", "WHATSAPP_DESTINO", "CODIGO_PEDIDO"
      ]]);
    }
    
    // Insertar fila
    sheet.appendRow([
      orderId,
      fechaISO,
      orderData.telefono,
      orderData.nombre,
      orderData.direccion || "",
      departamentoPedido,
      productosStr,
      orderData.total || 0,
      orderData.metodo_pago || "efectivo",
      orderData.notas || "",
      "PENDIENTE",
      whatsappDestino,
      orderId
    ]);
    
    // 7. Preparar mensaje para WhatsApp
    var mensajeWhatsApp = generarMensajeWhatsApp(orderData, departamentoPedido, orderId);
    
    // 8. Sincronizar con Supabase (OPCIONAL - no crítico)
    var syncResult = { success: false, error: "No intentado" };
    try {
      syncResult = syncOrderToSupabase({
        id_pedido: orderId,
        telefono_cliente: orderData.telefono,
        nombre_cliente: orderData.nombre,
        direccion_entrega: orderData.direccion || "",
        productos: orderData.productos || [],
        total: orderData.total || 0,
        metodo_pago: orderData.metodo_pago || "efectivo",
        notas: orderData.notas || "",
        estado: "PENDIENTE",
        fecha_pedido: fechaISO,
        departamento: departamentoPedido
      });
    } catch (syncError) {
      console.error("Error en sincronización Supabase:", syncError);
      syncResult = { success: false, error: syncError.toString() };
    }
    
    // 9. Retornar respuesta
    var response = {
      success: true,
      order_id: orderId,
      message: "Pedido creado exitosamente",
      timestamp: fechaISO,
      pedido: {
        codigo: orderId,
        departamento: departamentoPedido,
        whatsapp_destino: whatsappDestino,
        mensaje: mensajeWhatsApp,
        enlace_whatsapp: "https://wa.me/" + whatsappDestino + 
                         "?text=" + encodeURIComponent(mensajeWhatsApp)
      },
      sync_supabase: syncResult.success,
      sync_message: syncResult.success ? "Sincronizado" : "No sincronizado: " + (syncResult.error || "Desconocido")
    };
    
    return response;
    
  } catch (error) {
    console.error("Error en createOrder:", error);
    return { 
      success: false, 
      error: "Error creando pedido: " + error.toString(),
      detalles: error.stack
    };
  }
}

// ==================== 10. FUNCIONES PARA DEPARTAMENTOS ====================

function getDepartamentos() {
  try {
    var departamentos = getSheetDataArray("DEPARTAMENTOS");
    return { 
      success: true, 
      count: departamentos.length, 
      data: departamentos.map(function(d) {
        return {
          id: d.ID || d.id || "",
          nombre: d.NOMBRE || d.nombre || "",
          telefono: d.TELEFONO || d.telefono || "",
          icono: d.ICONO || d.icono || "🏪"
        };
      }) 
    };
  } catch (error) {
    return { success: false, error: error.toString(), data: [] };
  }
}

// ==================== 11. FUNCIÓN PARA OBTENER CONFIGURACIÓN ====================

function getConfig() {
  try {
    var data = getSheetDataArray("CONFIG");
    var configObj = {};
    
    data.forEach(function(item) {
      var key = (item.LLAVE || item.llave || item.clave || "").toString().toLowerCase().trim();
      if (key) {
        configObj[key] = item.VALOR || item.valor || "";
      }
    });
    
    // Valores por defecto
    if (!configObj.tasa_cambio && configObj.tasa) {
      configObj.tasa_cambio = configObj.tasa;
    }
    configObj.tasa_cambio = configObj.tasa_cambio || "36.5";
    configObj.whatsapp_principal = configObj.whatsapp_principal || "584241208234";
    configObj.whatsapp_coordinador = configObj.whatsapp_coordinador || configObj.whatsapp_principal;
    
    return { success: true, data: configObj };
    
  } catch (error) {
    return { success: false, error: error.toString(), data: {} };
  }
}

// ==================== 12. FUNCIÓN PARA VALIDAR CARRITO ====================

function validarCarrito(productos) {
  try {
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return { 
        success: true, 
        valido: true, 
        departamento: null,
        mensaje: "Carrito vacío" 
      };
    }
    
    // Obtener departamento del primer producto
    var primerDepartamento = productos[0].departamento || "General";
    var todosIguales = true;
    
    // Verificar que todos los productos tengan el mismo departamento
    for (var i = 1; i < productos.length; i++) {
      var deptProducto = productos[i].departamento || "General";
      if (deptProducto !== primerDepartamento) {
        todosIguales = false;
        break;
      }
    }
    
    if (!todosIguales) {
      return {
        success: true,
        valido: false,
        mensaje: "⚠️ No puedes mezclar productos de diferentes departamentos. Tu carrito contiene productos de \"" + primerDepartamento + "\" y otros departamentos. Por favor, finaliza esta compra primero.",
        departamento_actual: primerDepartamento
      };
    }
    
    return {
      success: true,
      valido: true,
      departamento: primerDepartamento,
      mensaje: "✅ Carrito válido. Todos los productos son del departamento: " + primerDepartamento
    };
    
  } catch (error) {
    return {
      success: false,
      valido: false,
      mensaje: "Error validando carrito: " + error.toString()
    };
  }
}

// ==================== 13. FUNCIÓN PARA REGISTRAR CLIENTE ====================

function registerCustomer(customerData) {
  try {
    var ss = SpreadsheetApp.openById(SS_ID);
    var sheet = ss.getSheetByName("CLIENTES");
    
    if (!sheet) {
      sheet = ss.insertSheet("CLIENTES");
      sheet.getRange(1, 1, 1, 7).setValues([[
        "TELEFONO", "NOMBRE", "DIRECCION", "EMAIL", 
        "TOTAL_PEDIDOS", "FECHA_REGISTRO", "ULTIMA_COMPRA"
      ]]);
    }
    
    var phoneClean = customerData.telefono ? customerData.telefono.toString().replace(/\D/g, '') : "";
    var data = sheet.getDataRange().getValues();
    var existingRow = -1;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().replace(/\D/g, '') === phoneClean) {
        existingRow = i;
        break;
      }
    }
    
    var now = new Date().toISOString();
    
    if (existingRow === -1) {
      sheet.appendRow([
        phoneClean,
        customerData.nombre || "",
        customerData.direccion || "",
        customerData.email || "",
        1,
        now,
        now
      ]);
      
      return { 
        success: true, 
        nuevo: true, 
        mensaje: "Cliente registrado exitosamente" 
      };
    } else {
      var row = existingRow + 1;
      var totalCompras = (parseInt(data[existingRow][4]) || 0) + 1;
      
      sheet.getRange(row, 2).setValue(customerData.nombre || data[existingRow][1]);
      sheet.getRange(row, 3).setValue(customerData.direccion || data[existingRow][2]);
      sheet.getRange(row, 4).setValue(customerData.email || data[existingRow][3]);
      sheet.getRange(row, 5).setValue(totalCompras);
      sheet.getRange(row, 7).setValue(now);
      
      return { 
        success: true, 
        nuevo: false, 
        mensaje: "Cliente actualizado" 
      };
    }
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ==================== 14. FUNCIÓN PARA OBTENER CINTILLO ====================

function getCintillo() {
  try {
    var data = getSheetDataArray("CINTILLO");
    var activeCintillo = [];
    
    data.forEach(function(item) {
      var texto = item.TEXTO || item.texto || "";
      var activo = (item.ACTIVO || item.activo || "").toString().toUpperCase();
      
      if (texto && (activo === "SI" || activo === "SÍ" || activo === "TRUE" || activo === "1")) {
        activeCintillo.push({
          texto: texto,
          tipo: item.TIPO || item.tipo || "info"
        });
      }
    });
    
    return { success: true, data: activeCintillo };
    
  } catch (error) {
    return { success: false, error: error.toString(), data: [] };
  }
}

// ==================== 15. FUNCIÓN PARA ACTUALIZAR TASA ====================

function updateTasa(newTasa) {
  try {
    var sheet = SpreadsheetApp.openById(SS_ID).getSheetByName("CONFIG");
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase().includes("tasa")) {
        sheet.getRange(i + 1, 2).setValue(newTasa);
        SpreadsheetApp.flush();
        return { 
          success: true, 
          message: "Tasa actualizada a: " + newTasa,
          tasa: newTasa
        };
      }
    }
    
    sheet.appendRow(["tasa_cambio", newTasa, "Actualizado desde App"]);
    SpreadsheetApp.flush();
    
    return { 
      success: true, 
      message: "Tasa creada y actualizada a: " + newTasa,
      tasa: newTasa
    };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ==================== 16. FUNCIÓN PARA ACTUALIZAR CONFIGURACIÓN ====================

function updateConfig(key, value) {
  try {
    var ss = SpreadsheetApp.openById(SS_ID);
    var sheet = ss.getSheetByName("CONFIG");
    
    if (!sheet) {
      sheet = ss.insertSheet("CONFIG");
      sheet.getRange(1, 1, 1, 3).setValues([["LLAVE", "VALOR", "DESCRIPCION"]]);
    }
    
    var data = sheet.getDataRange().getValues();
    var updated = false;
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase() === key.toLowerCase()) {
        sheet.getRange(i + 1, 2).setValue(value);
        updated = true;
        break;
      }
    }
    
    if (!updated) {
      sheet.appendRow([key, value, ""]);
    }
    
    SpreadsheetApp.flush();
    
    return { 
      success: true, 
      message: "Configuración actualizada" 
    };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ==================== 17. FUNCIÓN PARA BUSCAR CLIENTE ====================

function searchCustomer(phone) {
  try {
    var phoneClean = phone.toString().replace(/\D/g, '');
    
    var ss = SpreadsheetApp.openById(SS_ID);
    var sheet = ss.getSheetByName("CLIENTES");
    
    if (sheet) {
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] && data[i][0].toString().replace(/\D/g, '') === phoneClean) {
          return {
            encontrado: true,
            cliente: {
              telefono: data[i][0] || "",
              nombre: data[i][1] || "",
              direccion: data[i][2] || "",
              email: data[i][3] || ""
            }
          };
        }
      }
    }
    
    return { encontrado: false, cliente: null };
    
  } catch (error) {
    return { encontrado: false, error: error.toString() };
  }
}

// ==================== 18. FUNCIÓN PARA PROCESAR IMAGEN DESDE APPSHEET ====================

function procesarImagenDesdeAppSheet(idProducto, rutaImagen) {
  var resultado = { 
    success: false, 
    id: idProducto, 
    mensaje: "",
    url: ""
  };
  
  try {
    var ss = SpreadsheetApp.openById(SS_ID);
    var sheet = ss.getSheetByName("PRODUCTOS");
    
    if (!sheet) {
      resultado.mensaje = "Error: Hoja PRODUCTOS no encontrada";
      return resultado;
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var columnaId = headers.indexOf("ID");
    var columnaUrlPublica = headers.indexOf("ImagenURL_Publica");
    
    if (columnaId === -1) {
      resultado.mensaje = "Error: Columna 'ID' no encontrada";
      return resultado;
    }
    
    var filaEncontrada = -1;
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][columnaId]).trim() === String(idProducto).trim()) {
        filaEncontrada = i;
        break;
      }
    }
    
    if (filaEncontrada === -1) {
      resultado.mensaje = "Error: Producto " + idProducto + " no encontrado";
      return resultado;
    }
    
    if (!rutaImagen || rutaImagen.trim() === "") {
      resultado.mensaje = "Error: Ruta de imagen vacía";
      return resultado;
    }
    
    var nombreArchivo = rutaImagen.split('/').pop();
    var archivos = DriveApp.getFilesByName(nombreArchivo);
    
    if (!archivos.hasNext()) {
      resultado.mensaje = "Error: Archivo '" + nombreArchivo + "' no encontrado";
      
      if (columnaUrlPublica !== -1) {
        sheet.getRange(filaEncontrada + 1, columnaUrlPublica + 1).setValue("NO_ENCONTRADO");
        SpreadsheetApp.flush();
      }
      
      return resultado;
    }
    
    var archivo = archivos.next();
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var urlPublica = "https://drive.google.com/uc?export=view&id=" + archivo.getId();
    
    if (columnaUrlPublica !== -1) {
      sheet.getRange(filaEncontrada + 1, columnaUrlPublica + 1).setValue(urlPublica);
      SpreadsheetApp.flush();
    }
    
    resultado.success = true;
    resultado.url = urlPublica;
    resultado.mensaje = "Imagen procesada correctamente";
    
    return resultado;
    
  } catch (error) {
    resultado.mensaje = "Error inesperado: " + error.toString();
    return resultado;
  }
}

// ==================== 19. FUNCIÓN PARA PROCESAR IMÁGENES PENDIENTES ====================

function procesarImagenesPendientes() {
  var resultados = {
    total: 0,
    exitos: 0,
    errores: 0,
    detalles: []
  };
  
  try {
    var ss = SpreadsheetApp.openById(SS_ID);
    var sheet = ss.getSheetByName("PRODUCTOS");
    
    if (!sheet) {
      return resultados;
    }
    
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var columnaId = headers.indexOf("ID");
    var columnaImagen = headers.indexOf("ImagenURL");
    var columnaUrlPublica = headers.indexOf("ImagenURL_Publica");
    
    if (columnaId === -1 || columnaImagen === -1) {
      return resultados;
    }
    
    for (var i = 1; i < data.length; i++) {
      var idProducto = data[i][columnaId];
      var rutaImagen = data[i][columnaImagen];
      var urlPublica = columnaUrlPublica !== -1 ? data[i][columnaUrlPublica] : "";
      
      resultados.total++;
      
      if (rutaImagen && rutaImagen !== "" && (!urlPublica || urlPublica === "")) {
        var resultado = procesarImagenDesdeAppSheet(idProducto, rutaImagen);
        resultados.detalles.push(resultado);
        
        if (resultado.success) {
          resultados.exitos++;
        } else {
          resultados.errores++;
        }
        
        Utilities.sleep(1000);
      }
    }
    
  } catch (error) {
    resultados.detalles.push({ error: error.toString() });
  }
  
  return resultados;
}

// ==================== 20. FUNCIÓN PARA PROBAR CONEXIÓN ====================

function testConnection() {
  try {
    var ss = SpreadsheetApp.openById(SS_ID);
    var sheets = ss.getSheets();
    var sheetNames = sheets.map(function(s) { return s.getName(); });
    
    // Probar Supabase
    var supabaseTest = { connected: false };
    try {
      var url = SUPABASE_URL + '/rest/v1/pedidos?limit=1';
      var response = UrlFetchApp.fetch(url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY
        },
        'muteHttpExceptions': true
      });
      supabaseTest.connected = response.getResponseCode() === 200;
      supabaseTest.status = response.getResponseCode();
    } catch (e) {
      supabaseTest.error = e.toString();
    }
    
    return {
      success: true,
      google_sheets: {
        connected: true,
        sheets_count: sheets.length,
        sheet_names: sheetNames
      },
      supabase: supabaseTest,
      timestamp: new Date().toISOString(),
      app: "JX4 Paracotos v10.1.2"
    };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ==================== 21. FUNCIÓN PARA INICIALIZAR SISTEMA ====================

function initializeSystem() {
  try {
    var ss = SpreadsheetApp.openById(SS_ID);
    
    // Crear hojas si no existen
    var sheets = [
      { 
        name: "PRODUCTOS", 
        headers: ["ID", "NOMBRE", "PRECIO", "CATEGORIA", "DEPARTAMENTO", "DESCRIPCION", "ImagenURL", "ImagenURL_Publica", "ACTIVO", "UNIDAD"] 
      },
      { name: "DEPARTAMENTOS", headers: ["ID", "NOMBRE", "TELEFONO", "ICONO"] },
      { name: "CONFIG", headers: ["LLAVE", "VALOR", "DESCRIPCION"] },
      { name: "CINTILLO", headers: ["TEXTO", "ACTIVO", "TIPO"] },
      { name: "CLIENTES", headers: ["TELEFONO", "NOMBRE", "DIRECCION", "EMAIL", "TOTAL_PEDIDOS", "FECHA_REGISTRO", "ULTIMA_COMPRA"] },
      { 
        name: "PEDIDOS", 
        headers: ["ID_PEDIDO", "FECHA", "TELEFONO", "NOMBRE", "DIRECCION", "DEPARTAMENTO", "PRODUCTOS", "TOTAL", "METODO_PAGO", "NOTAS", "ESTADO", "WHATSAPP_DESTINO", "CODIGO_PEDIDO"] 
      }
    ];
    
    var createdSheets = [];
    
    sheets.forEach(function(sheetInfo) {
      var sheet = ss.getSheetByName(sheetInfo.name);
      if (!sheet) {
        sheet = ss.insertSheet(sheetInfo.name);
        sheet.getRange(1, 1, 1, sheetInfo.headers.length).setValues([sheetInfo.headers]);
        createdSheets.push(sheetInfo.name);
      }
    });
    
    // Agregar datos iniciales a CONFIG si está vacío
    var configSheet = ss.getSheetByName("CONFIG");
    if (configSheet && configSheet.getLastRow() <= 1) {
      configSheet.appendRow(["tasa_cambio", "36.5", "Tasa de cambio USD a VES"]);
      configSheet.appendRow(["whatsapp_principal", "584241208234", "WhatsApp para pedidos"]);
      configSheet.appendRow(["whatsapp_coordinador", "584241208234", "WhatsApp coordinador general"]);
      configSheet.appendRow(["admin_user", "jjtovar1006", "Usuario administrador"]);
      configSheet.appendRow(["admin_pass", "Apamate.25", "Contraseña administrador"]);
    }
    
    return { 
      success: true, 
      message: "Sistema inicializado" + (createdSheets.length > 0 ? ". Hojas creadas: " + createdSheets.join(", ") : ""),
      created: createdSheets
    };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

// ==================== 22. FUNCIÓN DE PRUEBA MANUAL ====================

function manualTest() {
  Logger.log("=== TEST MANUAL JX4 v10.1.2 ===");
  
  var test = testConnection();
  Logger.log("Conexión: " + JSON.stringify(test));
  
  var allData = getAllData();
  Logger.log("Productos: " + (allData.productos ? allData.productos.length : 0));
  Logger.log("Departamentos: " + (allData.departamentos ? allData.departamentos.length : 0));
  Logger.log("Tasa: " + allData.tasa_cambio);
  
  // Probar validación de carrito
  var productosTest = [
    { nombre: "Pollo Paracoto", departamento: "Aves", precio: 10, quantity: 1 },
    { nombre: "Muslos de Pollo", departamento: "Aves", precio: 8, quantity: 2 }
  ];
  
  var validacion = validarCarrito(productosTest);
  Logger.log("Validación carrito: " + JSON.stringify(validacion));
  
  return test;
}

// ==================== 23. FUNCIONES DE UI PARA GOOGLE SHEETS ====================

function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🚀 JX4 Sistema v10.1.2')
      .addItem('🔄 Inicializar Sistema', 'initializeSystem')
      .addItem('🔍 Probar Conexión', 'manualTest')
      .addItem('🖼️ Procesar Imágenes Pendientes', 'procesarImagenesPendientes')
      .addSeparator()
      .addItem('📊 Ver Datos', 'showData')
      .addToUi();
  } catch (error) {
    // Ignorar error si no estamos en contexto de UI
    console.log("No se puede crear menú UI en este contexto");
  }
}

function showData() {
  try {
    var ui = SpreadsheetApp.getUi();
    var data = getAllData();
    
    ui.alert('📊 Datos del Sistema JX4 v10.1.2', 
      '✅ Productos: ' + data.productos.length + '\n' +
      '🏪 Departamentos: ' + data.departamentos.length + '\n' +
      '💱 Tasa de cambio: ' + data.tasa_cambio + '\n' +
      '📢 Cintillos activos: ' + data.cintillo.length + '\n\n' +
      '🔧 Sistema de validación por departamento ACTIVO',
      ui.ButtonSet.OK);
  } catch (error) {
    // Esta función solo funciona en el contexto de Google Sheets UI
    console.log("showData solo funciona en la UI de Google Sheets");
  }
}

// ==================== 24. ENDPOINTS DE PRUEBA ====================

function testEndpoints() {
  var tests = [
    { name: "Ping", url: "?action=ping" },
    { name: "Status", url: "?action=status" },
    { name: "Productos", url: "?action=productos" },
    { name: "Departamentos", url: "?action=departamentos" },
    { name: "All Data", url: "?action=all_data" },
    { name: "Validar Carrito", url: "?action=validar_carrito&productos=" + encodeURIComponent(JSON.stringify([{departamento: "Aves"}])) }
  ];
  
  var results = [];
  
  tests.forEach(function(test) {
    try {
      var mockEvent = { parameter: { action: test.url.split('=')[1] } };
      
      // Para validar_carrito necesitamos parámetro adicional
      if (test.name === "Validar Carrito") {
        mockEvent.parameter.action = "validar_carrito";
        mockEvent.parameter.productos = '[{"departamento":"Aves"}]';
      }
      
      var response = doGet(mockEvent);
      var content = JSON.parse(response.getContent());
      results.push({
        test: test.name,
        success: content.success,
        data: content.data ? "Datos recibidos" : "Sin datos"
      });
    } catch (error) {
      results.push({
        test: test.name,
        success: false,
        error: error.toString()
      });
    }
  });
  
  return results;
}