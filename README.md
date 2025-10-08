# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Address autocomplete provider (free to start)

This app supports multiple geocoding/autocomplete providers. Configure them via `app.json` under `expo.extra`:

- `geocodingProvider`: one of `maps-co` (default), `google`, or `mapbox`.
- `geocodeMapsApiKey`: API key for https://geocode.maps.co (generous free tier; easiest to start).
- `googlePlacesApiKey`: Google Places API key (when using `google`). The UI will show the required “Powered by Google” attribution.
- `mapboxAccessToken`: Mapbox token (when using `mapbox`). Be aware of Mapbox’s terms requiring use with a Mapbox map.

After changing `app.json`, restart the dev server so the `extra` values reload.

Files to see:

- `components/AddressAutocomplete.tsx` – debounced search with provider fallback.
- `services/geocoding.ts` – pluggable providers implementation.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
