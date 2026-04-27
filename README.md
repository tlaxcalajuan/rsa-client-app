# RSA Voice Recognition Client

Este proyecto es una aplicación frontend desarrollada con **Angular 20** que permite capturar el nombre del usuario mediante teclado o **reconocimiento de voz** (Web Speech API). El nombre capturado se envía a un servidor backend para ser encriptado utilizando el algoritmo **RSA**.

## Características

- **Reconocimiento de voz**: Utiliza la API nativa del navegador para capturar texto de forma interactiva.
- **Encriptación RSA**: Se integra con un servicio backend para asegurar la información.
- **Copiado al portapapeles**: Permite copiar el resultado encriptado fácilmente.
- **Diseño Responsivo**: Interfaz moderna y adaptable.

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).
- [Angular CLI](https://angular.io/cli) instalado globalmente (`npm install -g @angular/cli`).

## Instalación

1. Navega al directorio del cliente:
   ```bash
   cd rsa-client-app
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```

## Ejecución

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200/`.

## Pruebas Unitarias

El proyecto cuenta con pruebas unitarias exhaustivas para asegurar el correcto funcionamiento de los componentes y servicios.

Para ejecutar las pruebas:

```bash
npm test
```

## Despliegue en Producción

La aplicación está desplegada en **Vercel**:
[https://rsa-client-app.vercel.app/](https://rsa-client-app.vercel.app/)

## Configuración

Las variables de entorno y la URL de la API se gestionan mediante archivos de entorno en:
`src/app/enviroments/environment.ts` (para desarrollo) y configuraciones de **Vercel** (para producción).
