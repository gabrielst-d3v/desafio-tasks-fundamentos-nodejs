// ['search=Gabriel', 'page=2']

// ['search', 'Gabriel']
// ['page', '2']

export function extractQueryParams(query) {
  return query.substr(1).split('&').reduce((querypParams, param) => {
		const [key, value] = param.split('=')

		querypParams[key] = value

		return querypParams
	}, {})
}