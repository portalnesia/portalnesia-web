import React from 'react'
import dynamic from 'next/dynamic'
import {Portal,DialogProps,Typography} from '@mui/material'
import {useRouter} from 'next/router'

const Dialog=dynamic(()=>import('@mui/material/Dialog'))
const DialogTitle=dynamic(()=>import('@mui/material/DialogTitle'))
const DialogContent=dynamic(()=>import('@mui/material/DialogContent'))
const CloseIcon = dynamic(()=>import('@mui/icons-material/Close'))
const IconButton=dynamic(()=>import('@mui/material/IconButton'))
const TextField = dynamic(()=>import('@mui/material/TextField'))
const List = dynamic(()=>import('@mui/material/List'))
const ListItem = dynamic(()=>import('@mui/material/ListItemButton'))
const ListItemText = dynamic(()=>import('@mui/material/ListItemText'))

type IMenuWithoutChild = {
  key: string,
  name: string,
  href?: string,
  as?: string,
}

export interface IMenu extends IMenuWithoutChild {
  child?: IMenuWithoutChild[]
  menu?: boolean;
  
}

interface IMenuFilter extends IMenuWithoutChild {
  parent?: IMenuWithoutChild
  label?:string
}

export interface SearchProps extends DialogProps {
  menu?: IMenu[]
  onSearch?(data: IMenuFilter): void
}

function SearchComp(props: SearchProps) {
  const router = useRouter();
  const {menu=[],open,scroll='body',maxWidth='md',fullWidth=true,onClose,onSearch} = props;
  const [input,setInput] = React.useState("");

  const handleClose=React.useCallback((e?:{},reason?: "backdropClick" | "escapeKeyDown")=>{
    if(!reason || e && reason === 'escapeKeyDown') {
      setInput("");
      if(onClose) onClose({},'backdropClick');
    }
  },[onClose])

  const handleChange=React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)=>{
    setInput(e.target.value)
  },[])

  const menus = React.useMemo(()=>{
    let menus: IMenuFilter[]=[];
    menu.forEach(m=>{
      if(!m.child) menus.push(m);
      else {
        if(typeof m?.menu !== 'boolean' && m?.menu === false) {
          const child = m.child.map(c=>({
            ...c,
            label:c.name,
            parent:{
              key:m?.name,
              name:m?.name
            }
          }))
          menus = menus.concat(child)
        } else {
          const {child,key,...rest} = m;
          menus.push({key,...rest});
          child.map(c=>{
            menus.push({...c,label:m.name,parent:{key,...rest}})
          })
        }
      }
    })
    return menus;
  },[menu])

  const menuFilter = React.useMemo(()=>{
    if(input.length === 0) return [];
    const filter = menus?.filter(i=>{
      return i.name.toLowerCase().indexOf(input.toLowerCase()) > -1 ||
      i?.parent && i.parent.name.toLowerCase().indexOf(input.toLowerCase()) > -1
    });
    return filter.slice(0,14);
  },[input,menus]);

  const onSearchClick=React.useCallback((m: IMenuFilter)=>()=>{
    if(onSearch) onSearch(m);
    else router.push(m?.href,m?.as)
    handleClose();
  },[handleClose]) 

  return (
    <Portal>
      {open && (
        <Dialog open maxWidth={maxWidth} fullWidth={fullWidth} scroll={scroll}>
          <DialogTitle>
            <div className='flex-header'>
              <Typography component='h2' variant='h6'>Search</Typography>
              <IconButton onClick={handleClose} size="large">
                  <CloseIcon />
              </IconButton>
            </div>
          </DialogTitle>
          <DialogContent dividers>
            <div>
              <TextField
                placeholder='Search...'
                value={input}
                onChange={handleChange}
                fullWidth
                autoFocus
              />
              {menuFilter?.length > 0 && (
                <List>
                  {menuFilter.map((m,i)=>(
                    <ListItem
                      key={`search-list-${i}`}
                      onClick={onSearchClick(m)}
                    >
                      <ListItemText
                        primary={m?.name}
                        secondary={m?.label}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Portal>
  )
}

const Search = React.memo(SearchComp)
export default Search;