# Guía de Storybook para empezar a trabajar

Esta guía está pensada para quien nunca ha usado Storybook. Al terminarla sabrás arrancarlo, entender qué hay en el repo, escribir una story y resolver los errores más comunes.

## 1. Qué es Storybook y para qué sirve aquí

Storybook es una aplicación que muestra cada componente **aislado**, sin necesidad de montar una página completa. Cada estado de un componente se escribe como una **story** (una "historia": un ejemplo con unos valores concretos).

En este repo sirve para tres cosas:

1. **Ver y probar a mano** los elementos (`blk-input`, `blk-control`…) con un panel de controles para cambiar sus atributos, sin tocar código.
2. **Documentar** su API: atributos, eventos, variables CSS, etc.
3. **Revisar a ojo** lo que los tests unitarios no ven: aspecto, foco, tamaños de pantalla.

Storybook se usa aquí **solo como demo y documentación**. Los tests están en cada paquete (`packages/<pkg>/test`) y no dependen de Storybook.

Usamos **Storybook 11 (beta)**. Su novedad para web components es que lee el `custom-elements.json` (el "manifiesto" de cada paquete) y con él construye solo el panel de controles. Antes solo aparecían las propiedades; ahora también slots, eventos, variables CSS, parts, states y métodos.

## 2. Primer arranque

Requisitos: **Node 22.12 o superior**.

```sh
npm install                          # una sola vez, en la raíz del repo
npm run storybook                    # abre http://localhost:6006
```

Verás una barra lateral con los elementos. Elige una story y prueba:

- **Controls** (panel inferior): cambia `label`, `required`, `disabled`… y el elemento se actualiza.
- **Actions**: muestra los eventos que dispara el elemento (si la story lo pide con `fn()`, ver sección 6).

## 3. Mapa del repo

```
.storybook/
  main.ts            ← configuración principal (dónde están las stories y los manifiestos)
  preview.ts         ← ajustes globales de todas las stories
packages/<paquete>/
  stories/
    <elemento>.stories.ts   ← las stories de ese elemento
    tsconfig.json           ← para que TypeScript y ESLint entiendan los archivos de stories
  custom-elements.json      ← manifiesto (se GENERA, no se edita a mano)
```

Hay **un único Storybook en la raíz** que muestra los seis paquetes.

## 4. Anatomía de una story

Este es el ejemplo real de `packages/blk-input/stories/blk-input.stories.ts`, simplificado:

```ts
import type {Meta, StoryObj} from '@storybook/web-components-vite';
import '@blockquote-playground/blk-input/blk-input.js'; // registra <blk-input>

const meta: Meta = {
  title: 'blk-input/blk-input', // ruta en la barra lateral
  component: 'blk-input', // etiqueta del elemento: de aquí salen los controles
  args: {label: 'Name'}, // valores por defecto de TODAS las stories de este archivo
};

export default meta;
type Story = StoryObj;

export const Default: Story = {}; // usa solo los args del meta

export const Required: Story = {
  args: {label: 'Email', type: 'email', required: true}, // cambia o añade args
};
```

Ideas clave:

- **`meta`** describe el componente. Es el `export default`.
- **Cada `export const` es una story.** El nombre se convierte en el título (`Required` → "Required").
- **`args`** son los valores que se pasan al elemento. Son los mismos que ves en el panel Controls.
- No hace falta escribir `render`: Storybook crea el elemento y aplica cada arg según su clave (sección 5).

## 5. Cómo se rellenan los controles: el manifiesto

Storybook no mira tu código TypeScript al azar. Lee el **`custom-elements.json`**, que genera la herramienta `cem analyze` a partir de los **comentarios JSDoc** de la clase. Por eso:

> **Si algo no aparece en Controls, casi siempre es que falta su JSDoc o que no has regenerado el manifiesto.**

Qué comentario genera qué fila de controles:

| En la clase (JSDoc)        | Fila en Controls     | Clave del arg                  |
| -------------------------- | -------------------- | ------------------------------ |
| `@property` / `@attribute` | Atributo / propiedad | nombre plano: `label`          |
| `@cssprop [--x=valor]`     | Variable CSS         | `--x`                          |
| `@slot nombre`             | Slot                 | `nombre-slot` (`default-slot`) |
| `@fires nombre`            | Evento               | `nombre-event`                 |
| `@csspart nombre`          | Shadow part          | `nombre-part`                  |
| `@cssState nombre`         | Estado CSS           | `nombre-state`                 |
| métodos públicos           | Método               | `nombre-method`                |

Ejemplo, en `BlkInput.ts`:

```ts
/**
 * @fires validation - Evento con el ValidityState actual.
 * @cssprop [--input-element-outline-color=#79747e] - Color del borde.
 */
export class BlkInput extends ... {}
```

Después de cambiar un JSDoc, regenera:

```sh
npm run analyze     # actualiza custom-elements.json y el README del paquete
```

**Nunca edites `custom-elements.json` a mano**: se sobrescribe.

### Cómo se aplica cada arg

El render por defecto decide qué hacer según la clave:

| Clave                         | Qué hace                                                |
| ----------------------------- | ------------------------------------------------------- |
| `--nombre`                    | variable CSS inline en el elemento                      |
| propiedad del elemento        | asigna la propiedad                                     |
| atributo que no es propiedad  | `setAttribute` (`true` lo pone vacío, `false` lo quita) |
| `nombre-event` con función    | listener del evento `nombre`                            |
| `nombre-slot`, `default-slot` | inserta ese HTML en el slot                             |
| `nombre-part`, `nombre-state` | regla `::part()` / `:state()` solo para esa story       |

Ejemplo con varios tipos a la vez:

```ts
export const Themed: Story = {
  args: {
    label: 'Name',
    '--input-element-outline-color': 'tomato',
    'default-slot': '<span>contenido</span>',
  },
};
```

## 6. Eventos y `fn()`

Para ver un evento en el panel **Actions**, pasa `fn()` como arg con sufijo `-event`:

```ts
import {fn} from 'storybook/test';

export const Checkbox: Story = {
  args: {type: 'checkbox', 'change-event': fn(), 'validation-event': fn()},
};
```

Sin `fn()` el render por defecto **no** registra el evento.

## 7. Escribir una story nueva, paso a paso

Ejemplo: quieres una story "deshabilitado" para `blk-input`.

1. Abre `packages/blk-input/stories/blk-input.stories.ts`.
2. Añade al final:
   ```ts
   export const Disabled: Story = {
     args: {label: 'Name', disabled: true},
   };
   ```
3. Guarda. Storybook recarga solo; verás **Disabled** en la barra lateral.
4. Comprueba que se ve bien y que los controles funcionan.
5. Pasa el formato y el lint: `npm run lint`.

Para un **elemento nuevo**, además:

1. Crea `packages/<paquete>/stories/<elemento>.stories.ts`.
2. Copia el `stories/tsconfig.json` de otro paquete (si el paquete no tiene `customConditions: ["workspaces"]` en su `tsconfig.json`, añádelo en el de stories).
3. Añade `storybook` como devDependency del paquete (`npm i -D storybook@next -w @blockquote-playground/<paquete>`), porque ESLint exige declarar lo que se importa.
4. En el `eslint.config.js` del paquete, añade `` `**/stories/**/*.${fileTypes}` `` a la lista `devDependencies` de la regla `import-x/no-extraneous-dependencies`.
5. Asegúrate de que el manifiesto del paquete aparece en `customElementsManifest` de `.storybook/main.ts`.

## 8. Errores comunes

| Síntoma                                                      | Causa probable                                                            | Solución                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| El panel Controls está vacío o incompleto                    | Falta JSDoc o el manifiesto está viejo                                    | Añade el JSDoc y ejecuta `npm run analyze`                |
| Un `argTypes` o `render` antiguo "no hace nada"              | Usas la clave sin sufijo (`'my-change'`)                                  | Usa `'my-change-event'`, `'actions-slot'`, `'label-part'` |
| Un decorator falla al llamar métodos del elemento            | El render devuelve un `DocumentFragment` con el elemento como último hijo | Lee `result.lastElementChild`                             |
| Un elemento registrado tarde (lazy) ignora los controles     | No se puede inspeccionar antes de renderizar                              | Importa el elemento al principio del archivo de stories   |
| `git commit` rechazado por commitlint                        | Líneas del cuerpo de más de 100 caracteres                                | Acorta el mensaje                                         |
| `'storybook' should be listed in the project's dependencies` | El paquete no declara `storybook`                                         | Mira el paso 3 de "elemento nuevo"                        |

## 9. Cosas a tener presentes

- **Es una beta** (`11.0.0-beta.x`). Puede haber errores propios de Storybook. Si algo raro no tiene explicación en el código, busca la incidencia en el repositorio de Storybook antes de gastar horas.
- `setCustomElementsManifest()` está **deprecado** y no se usa en este repo.
- La guía de migración de Storybook 11 avisa de regresiones temporales en la generación de los snippets de código fuente (los que se muestran en Docs). No las hemos probado con estos elementos.
- Las reglas de comportamiento de los elementos (error solo con "user validity", nombre accesible, `referenceTarget`…) están en `CLAUDE.md`. Una story no debe saltárselas.

## 10. Chuleta de comandos

| Comando                   | Para qué                                            |
| ------------------------- | --------------------------------------------------- |
| `npm run storybook`       | Arranca Storybook en `localhost:6006`               |
| `npm run build-storybook` | Genera la versión estática en `storybook-static/`   |
| `npm run analyze`         | Regenera `custom-elements.json` y los README        |
| `npm run lint`            | ESLint, Prettier y Stylelint (escribe los arreglos) |

## 11. Glosario mínimo

- **Story**: un ejemplo del componente con valores concretos.
- **Args**: los valores que se pasan al componente; son los del panel Controls.
- **Meta**: la descripción del componente (el `export default` del archivo de stories).
- **Controls / Actions**: paneles de Storybook para cambiar valores y ver los eventos que dispara el elemento.
- **CEM / manifiesto** (`custom-elements.json`): descripción de la API del elemento en formato estándar.
- **JSDoc**: comentarios `/** … */` con etiquetas (`@fires`, `@cssprop`…) de los que sale el manifiesto.
