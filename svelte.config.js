import adapter from '@sveltejs/adapter-node';
import dotenv from 'dotenv';

// 환경 변수를 로드합니다.
dotenv.config();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		csrf: {
			checkOrigin: false
		}
	}
};

export default config;
