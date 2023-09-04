export const errorDescription = (code: string) => {
    let errorMsg = '';
    switch (code) {
        case 'MAX_FILE_SIZE_ERROR':
            errorMsg = 'Data extraction file is too large';
            break;

    }
    return errorMsg;
}