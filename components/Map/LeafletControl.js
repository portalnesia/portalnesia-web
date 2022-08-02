import { createControlComponent} from '@react-leaflet/core';
import Locate from 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.min.css'

const LocateControl = createControlComponent(props=>{
  const { leaflet, ...options } = props;
  return new Locate(options);
})

export default LocateControl