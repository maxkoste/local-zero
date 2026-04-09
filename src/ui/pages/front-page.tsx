import React from 'react';
import { useState } from 'react';
import { User } from '../../backend/user'
import { users } from '../../backend/controller'
import NavBar from '../components/nav-bar';


//Denna funktionen exporteras och kan importeras genom att skriva:
//import {Hello} from './Frontpage'
export function FrontPage() {
	return (
		<div>
			<h1>Detta är frontpage</h1>
		</div>
	)

}
