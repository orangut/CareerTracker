import { Rating } from "@mui/material";

type StarRaitingProps = {
    value: number;
    onChange?: (_event: React.SyntheticEvent, newValue: number | null) => void;
};

const StarRaiting = ({ value, onChange }: StarRaitingProps) => (
    <Rating
        name="job-rating"
        value={value / 2.0}
        precision={0.5}
        readOnly={!onChange}
        onChange={onChange ? (_e, nV) => onChange(_e, nV ? nV * 2 : null) : undefined}

    />)

export default StarRaiting;