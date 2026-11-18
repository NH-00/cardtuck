interface MagicLinkEmailProps {
	locale: string;
	name: string;
	magicLink: string;
	messages: {
		preview: string;
		heading: string;
		greeting: string;
		waitingConfirmation: string;
		buttonLabel: string;
		fallbackLink: string;
		closing: string;
		teamPrefix: string;
	};
	layoutMessages: {
		copyright: string;
	};
}

export default function MagicLinkEmail({ locale, name, magicLink, messages, layoutMessages }: MagicLinkEmailProps) {
	return (
		<html lang={locale}>
			<head>
				<title>{messages.heading}</title>
			</head>
			<body style={{ margin: 0, backgroundColor: "#E8F2EC", fontFamily: "Arial, sans-serif", color: "#112D25" }}>
				<span style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>{messages.preview}</span>
				<table role="presentation" style={{ width: "100%", maxWidth: 600, margin: "24px auto", padding: 16 }}>
					<tbody>
						<tr>
							<td style={{ backgroundColor: "white", border: "1px solid #CBDCD3", borderRadius: 16, padding: 26 }}>
								<p style={{ color: "#00624D", fontWeight: 700, margin: "0 0 10px" }}>CardTuck</p>
								<h1 style={{ fontSize: 27, margin: "0 0 18px" }}>{messages.heading}</h1>
								<p style={{ lineHeight: 1.5 }}>
									{name},<br />
									{messages.greeting}
								</p>
								<p style={{ lineHeight: 1.5 }}>{messages.waitingConfirmation}</p>
								<p style={{ marginBlock: 24 }}>
									<a
										href={magicLink}
										style={{
											display: "inline-block",
											backgroundColor: "#00624D",
											color: "white",
											padding: "12px 18px",
											borderRadius: 8,
											textDecoration: "none",
											fontWeight: 700,
										}}
									>
										{messages.buttonLabel}
									</a>
								</p>
								<p style={{ color: "#44625A", fontSize: 13, overflowWrap: "anywhere" }}>
									{messages.fallbackLink}
									<br />
									<a href={magicLink} style={{ color: "#00624D" }}>
										{magicLink}
									</a>
								</p>
								<hr style={{ border: 0, borderTop: "1px solid #CBDCD3", marginBlock: 20 }} />
								<p style={{ fontSize: 14, color: "#44625A" }}>
									{messages.closing}
									<br />
									{messages.teamPrefix}
								</p>
							</td>
						</tr>
						<tr>
							<td style={{ padding: 16, textAlign: "center", color: "#44625A", fontSize: 12 }}>
								{layoutMessages.copyright}
							</td>
						</tr>
					</tbody>
				</table>
			</body>
		</html>
	);
}
