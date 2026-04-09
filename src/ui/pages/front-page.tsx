import React from 'react';
import { useState } from 'react';
import { User } from '../../backend/user'
import { users } from '../../backend/controller'


//Denna funktionen exporteras och kan importeras genom att skriva:
//import {Hello} from './Frontpage'
export function FrontPage() {
	return <h1>Detta är frontpage</h1>
}
