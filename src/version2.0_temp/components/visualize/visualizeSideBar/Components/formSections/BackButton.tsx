import ArrowBack from '@material-ui/icons/ArrowBackIos';

interface BackButtonProps {
    onClick: () => void;
}

export function BackButton({onClick}: BackButtonProps) {

    return (
        <div className='v2-visualize-backButtonContainer' 
            tabIndex={0} 
            onClick={onClick}
            onKeyDown={(e: any)=>{e.keyCode == '13' &&  onClick()}}>
            <ArrowBack fontSize='small' /> <div className='text'>Back</div>
        </div>
    );
}