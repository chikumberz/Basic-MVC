<?php

	class UserPermission extends Database {
		const TABLE_NAME = 'user_permission';

		public $id;
		public $user_role_id;
		public $user_permission_id;

	} // END UserPermission Class