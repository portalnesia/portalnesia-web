/*
 * Copyright (c) Portalnesia - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Putu Aditya <aditya@portalnesia.com>
 */

import NativeTypography from "@mui/material/Typography";
import {styled} from "@mui/material/styles";

const Ellipsis = styled(NativeTypography, {
	shouldForwardProp: prop => prop !== 'ellipsis'
})<{ ellipsis?: number }>(({ellipsis = 2}) => ({
	textOverflow: 'ellipsis',
	display: '-webkit-box!important',
	overflow: 'hidden',
	WebkitBoxOrient: 'vertical',
	WebkitLineClamp: ellipsis
}))

export default Ellipsis;