new deck.DeckGL({
    mapboxApiAccessToken: 'pk.eyJ1Ijoicm93aGl0c3dhbWkiLCJhIjoiY2tkN3A1dnRuMGJycjJ5czhqNmdscmZ1MyJ9.abR9R7t9yTNUfM3RON28AA',
    mapStyle: 'mapbox://styles/rowhitswami/ckda21nhf0sb21inxuxulbyg7',
    container: 'base-map',
    initialViewState: {
      longitude: -122.45,
      latitude: 37.8,
      zoom: 15
    },
    controller: true,
    layers: [
      new deck.ScatterplotLayer({
        data: [
          {position: [-122.45, 37.8], color: [255, 0, 0], radius: 100}
        ],
        getColor: d => d.color,
        getRadius: d => d.radius
      })
    ]
  });