import React from 'react'
import L from 'leaflet'
import {Map, Marker, TileLayer,Popup} from 'react-leaflet';
//import MarkerClusterGroup from 'react-leaflet-markercluster'
import {GestureHandling} from './GestureHandler'
import Fullscreen from './Fullscreen'
import Zoom from './Zoom'
import LeafletControl from './LeafletControl'
import icon from './Icon'
import 'leaflet/dist/leaflet.css'

const Maps=({coordinate,popup})=>{
    const [mapRef,setMapRef]=React.useState(null)
    const pointMarker=icon({
        icon:'calendar-alt',
        markerColor:'darkred'
    })
    React.useEffect(()=>{
        L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);
    })
    
    return(
        <Map zoomControl={false} center={coordinate} zoom={16} ref={(ref)=>{setMapRef(ref)}} style={{height:400,width:'100%'}} gestureHandling={true}>
            <Zoom />
            <Fullscreen />
            <LeafletControl flyTo={true} position='topleft' strings={{title:'Where am i?',popup:'You are within {distance} {unit} from this point'}}/>
            
            <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot; href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors | &copy; <a rel=&quot;noopener noreferrer&quot; target=&quot;_blank&quot; href=&quot;https://portalnesia.com&quot;>Portalnesia</a>"
            />

            <Marker position={coordinate} icon={pointMarker}>
                { popup && <Popup><h2>{popup}</h2></Popup> }
            </Marker>
        </Map>
    )
}

const MapSelectContainer=({coordinate,onadd,onchange,onremove})=>{
    const [mapRef,setMapRef]=React.useState(null)

    const pointMarker=icon({
        icon:'calendar-alt',
        markerColor:'darkred'
    })
    
    return(
        <Map ref={(ref)=>{setMapRef(ref)}} style={{height:400,width:'100%'}} onclick={onadd} {...(coordinate ? {center:coordinate,zoom:16} : {})}>
            <Fullscreen />
            <LeafletControl flyTo={true} position='topleft' strings={{title:'Where am i?',popup:'You are within {distance} {unit} from this point'}}/>
            
            <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a target=&quot;_blank&quot; rel=&quot;noopener noreferrer&quot; href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors | &copy; <a rel=&quot;noopener noreferrer&quot; target=&quot;_blank&quot; href=&quot;https://portalnesia.com&quot;>Portalnesia</a>"
            />

            { coordinate && <Marker position={coordinate} icon={pointMarker} onclick={onremove} ondragend={onchange} draggable /> }
        </Map>
    )
}

export const MapSelect=MapSelectContainer;

export default Maps;