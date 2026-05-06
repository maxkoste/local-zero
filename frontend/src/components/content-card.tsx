import { Card, CardContent, CardHeader, Typography, IconButton, Tooltip } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined"
import { useNavigate } from "react-router-dom";
import { IContent } from "shared";


type Props = {
	content: IContent;
	onDelete?: () => void;
};

export function ContentCard({ content, onDelete }: Props) {
	switch (content.type) {
		case "initiative":
			return <InitiativeCard content={content} onDelete={onDelete} />;
		case "update":
			return <BaseContentCard content={content} />;
		case "comment":
			return <BaseContentCard content={content} />;
	}
}

type BaseProps = {
	content: IContent;
	children?: React.ReactNode;
	onDelete?: () => void;
};

export function BaseContentCard({ content, children, onDelete }: BaseProps) {

	const navigate = useNavigate();

	return (
		<Card sx={{ maxWidth: 600, margin: "0 auto" }}>
			<CardHeader
				title={content.title || undefined}
				subheader={
					<>
						Posted by {" "}
						< Typography

							component="span"
							onClick={() => navigate(`/profile/${content.author.id}`)}
							sx={{
								cursor: "pointer",
								color: "primary.main",
								fontWeight: 500,
								"&:hover": { textDecoration: "underline" },
							}}
						>
							{ content.author.username }
						</Typography>
						{" · " + new Date(content.date).toLocaleDateString()}
					</>
				}
				action={
					onDelete && (
						<Tooltip title="Delete initiative">
							<IconButton onClick={onDelete} size="small" color="error">
								<DeleteOutlineIcon fontSize="small" />
							</IconButton>
						</Tooltip>
					)
				}
			/>
			<CardContent>
				<Typography variant="body2">{content.body}</Typography>
				{children}
			</CardContent>
		</Card>
	);
}

export function InitiativeCard({
	content,
	onDelete,
	showLink = true,
	detailed = false,
}: {
	content: IContent;
	onDelete?: () => void;
	showLink?: boolean;
	detailed?: boolean;
}) {
	const navigate = useNavigate();
	const updateCount = content.children.filter((c) => c.type === "update").length;

	return (
		<BaseContentCard content={content} onDelete={onDelete}>
			{detailed && (
				<>
					{content.visibility && (
						<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
							Visibility: {content.visibility}
						</Typography>
					)}
					{content.location && (
						<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
							Location: {content.location}
						</Typography>
					)}
					{content.duration && (
						<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
							Duration: {content.duration}
						</Typography>
					)}
				</>
			)}
			<Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
				{updateCount} update{updateCount !== 1 ? "s" : ""}
			</Typography>
			{showLink && (
				<Typography
					variant="caption"
					onClick={() => navigate(`/initiative/${content.id}`)}
					sx={{ cursor: "pointer", color: "primary.main", display: "block", mt: 0.5 }}
				>
					View initiative →
				</Typography>
			)}
		</BaseContentCard>
	);
}
