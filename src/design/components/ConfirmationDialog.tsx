import Portal from '@mui/material/Portal';
import {PureComponent, ReactElement, useCallback,useState} from 'react'
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@comp/Button';
import { DialogProps } from './Dialog';
import { Without } from '@type/general';

const Dialog = dynamic(()=>import('./Dialog'));

type ConfirmationDialogState = {
    open: boolean
}

export interface ConfirmationDialogProps {
    title?: string
    body?: string|ReactElement
    button?: string
    dialog?: Partial<DialogProps>
}

export default class ConfirmationDialog extends PureComponent<ConfirmationDialogProps,ConfirmationDialogState> {
    constructor(props: ConfirmationDialogProps) {
        super(props)

        this.state = {
            open:false
        }
        this.show = this.show.bind(this);
    }
    private resolve?: (isConfirm: boolean)=>void;

    private handleConfirmed(confirmed: boolean) {
        this.setState({open:false},()=>{
            if(this.resolve) this.resolve(confirmed);
        })
    }

    show() {
        return new Promise<boolean>((res,rej)=>{
            this.resolve = res;
            this.setState({open:true});
        })
    }

    render() {
        const title = this.props.title||"Are You Sure?";
        const button = this.props.button||"Delete";
        return (
            <Dialog
                maxWidth='xs'
                {...this.props.dialog}
                open={this.state.open} 
                handleClose={()=>this.handleConfirmed(false)} 
                fullScreen={false} 
                titleWithClose={false} 
                title={title}
                actions={
                    <>
                        <Button color='inherit' outlined onClick={()=>this.handleConfirmed(false)}>Cancel</Button>
                        <Button color='error' icon='delete' onClick={()=>this.handleConfirmed(true)}>{button}</Button>
                    </>
                }
            >
                <Box>
                    {(typeof this.props.body === "string" || typeof this.props.body === 'undefined') ? (
                        <>
                            <Typography gutterBottom>{this.props.body||"Delete?"}</Typography>
                            <Typography sx={{fontWeight:'bold',color:'error.main'}}>THIS ACTION CANNOT BE UNDONE!</Typography>
                        </>
                    ) : (
                        <>
                            {this.props.body}
                            <Typography sx={{fontWeight:'bold',color:'error.main',mt:2}}>THIS ACTION CANNOT BE UNDONE!</Typography>
                        </>
                    )}
                </Box>
            </Dialog>
        )
    }
}