const Logo = ({ size = 24 }: { size?: number }) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 500 500"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect x="106" y="162.166" width="106.141" height="106.141" rx="19" fill="#F8FA81" />
			<rect x="227.169" y="101" width="167.307" height="167.307" rx="19" fill="#21B6DD" />
			<rect x="227.06" y="283.042" width="116.935" height="116.935" rx="19" fill="#63F398" />
			<rect x="123.533" y="283.042" width="88.151" height="88.151" rx="19" fill="#FA7272" />
		</svg>
	)
}

export default Logo

