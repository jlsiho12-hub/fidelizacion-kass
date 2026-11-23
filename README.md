# 🛍️ Sistema de Tarjeta de Fidelización Digital - Kass moda y estilo

Una aplicación web completa y profesional para gestionar el programa de fidelización de clientes, acumulación de sellos por compras, recompensas exclusivas al llegar a 10 sellos y un sistema de referidos con beneficio mutuo (2 sellos de regalo para ambos).

---

## 🚀 Cómo Iniciar la Aplicación

Puedes iniciar la aplicación de dos maneras muy sencillas:

### Opción 1: Con un solo clic (Recomendada)
Haz doble clic en el archivo **`iniciar.bat`**.  
Se abrirá automáticamente en tu navegador web en:  
👉 **`http://localhost:3001`**

### Opción 2: Desde la terminal
```bash
npm start
```
(O en modo desarrollo con recarga en vivo: `npm run dev`)

---

## 🌟 Características Principales

### 1. 🏢 Perfil de la Empresa & Personalización de la Tarjeta
- **Foto / Logo de la tienda:** Sube la foto o logo de *Kass moda y estilo* directamente desde tu computador con previsualización inmediata.
- **Datos de contacto:** Edita nombre del negocio, slogan, teléfono, WhatsApp directo, Instagram (@kassmodayestilo) y dirección de la tienda.
- **Personalizador visual de la tarjeta:**
  - Elige temas de alta gama (*Rosa Alta Costura, Oro & Negro Luxe, Esmeralda Boutique, Púrpura Imperial, Azul Medianoche Chic*).
  - Selector de color de fondo y color de sellos personalizado.
  - Elige el ícono de los sellos: **Gema 💎, Corona 👑, Percha/Prenda 👗, Bolsa de compras 🛍️, Destello ✨ o Estrella ⭐**.
  - Vista previa interactiva en vivo mientras personalizas.
- **Catálogo de Premios:** Configura y edita los premios disponibles al completar 10 sellos (descuentos %, bonos de dinero, prendas o accesorios de regalo).
- **Seguridad:** Protegido por PIN de acceso administrativo (por defecto: `1234`, editable).

---

### 2. 💳 Tarjeta Digital del Cliente (Vista Móvil)
- El cliente tiene su **tarjeta de fidelización digital interactiva** en su celular.
- Visualización de sus **10 casillas de sellos**: los sellos acumulados brillan y se estampan con el ícono de la tienda.
- **Barra de progreso:** Muestra cuántos sellos lleva y cuántos le faltan para su premio.
- **Botón "Ver mi QR en Caja":** Genera su código QR personal para mostrarlo en el mostrador al momento de pagar.
- Historial transparente de todas sus compras y sellos ganados.

---

### 3. 👥 Sistema de Referidos (Beneficio 2 x 2)
- Cada cliente tiene un **código especial único** (ejemplo: `KASS-7842`) y un **enlace directo de invitación**.
- **Botón para compartir por WhatsApp en 1 clic:** Redacta automáticamente una invitación atractiva para sus amigas/os.
- **Código QR de referido:** Para que una amiga lo escanee directamente de celular a celular.
- **Regla Automática de Premiación:**
  - Cuando un amigo nuevo se registra con el código y realiza su **primera compra**:
    - El cliente nuevo recibe: **+1 sello de compra + 2 sellos de regalo**.
    - El cliente que lo refirió recibe automáticamente: **+2 sellos de regalo** en su tarjeta.
    - El sistema registra la bonificación en el historial de ambos de forma 100% automática.

---

### 4. 🎁 Recompensas al Completar 10 Sellos
- Cuando el cliente acumula 10 sellos, la tarjeta se ilumina con la insignia **¡PREMIO LISTO!**.
- En el panel del cajero/administrador, aparece el botón destacado: **"🎁 Canjear Premio de Fidelización"**.
- El administrador puede seleccionar:
  - **% de Descuento** en la compra.
  - **Bono en dinero** para su compra.
  - **Prenda o accesorio de regalo**.
  - O ingresar un **producto/premio libre personalizado**.
- Al confirmar el canje:
  - Se activa una celebración con confeti 🎉.
  - Se descuentan los 10 sellos y se inicia el nuevo ciclo de la tarjeta.
  - Se guarda el registro en el historial de premios entregados.

---

### 5. 🖨️ Cartel / Póster QR para el Mostrador de la Tienda
- En la pestaña **"Póster Mostrador"** del panel administrativo, encontrarás un diseño publicitario elegante y listo para imprimir con el botón **"Imprimir Cartel"**.
- Colócalo en el mostrador o caja de *Kass moda y estilo* para que los clientes escaneen con la cámara de su teléfono y se registren en 10 segundos.

---

## 🗄️ Base de Datos & Persistencia
- Utiliza **SQLite nativo de Node.js** (`node:sqlite`), sin necesidad de configuraciones complicadas de bases de datos externas.
- Los datos se guardan de forma permanente en el archivo local `server/fidelizacion.db`.
- Tienes la opción de **Exportar a Excel / CSV** toda tu base de clientes en cualquier momento desde el panel.
