# useEquipmentsMarkers

There might be other type of markers, eg project locations ect, 
useEquipmentsMarkers should be able to work with other data fetch hooks.

## Design

1. Use `MapMarker` type to make sure all google map markers share the same strcture

```ts
/**
 * @reference https://developers.google.com/maps/documentation/javascript/reference/marker
 */
type LatLng = {
  lat: number;
  lng: number;
}

type MapMaker = {
  position?: LatLng;
  icon?: string | imgSrc;
  label?: string;
  title?: string;
  info?: any;
  ...
}
```
