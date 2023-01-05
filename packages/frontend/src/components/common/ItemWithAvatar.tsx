import { ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import { FunctionComponent, ReactNode } from "react";
import PrimaryAvatar from "../utils/PrimaryAvatar";

type ItemWithAvatarProps = {
  icon?: ReactNode;
  primary?: ReactNode;
  secondary?: ReactNode;
};

const ItemWithAvatar: FunctionComponent<ItemWithAvatarProps> = (props) => {
  const { icon, primary, secondary } = props;

  return (
    <>
      <ListItem>
        {icon ? (
          <ListItemAvatar>
            <PrimaryAvatar>{icon}</PrimaryAvatar>
          </ListItemAvatar>
        ) : (
          <></>
        )}
        <ListItemText primary={primary} secondary={secondary}></ListItemText>
      </ListItem>
    </>
  );
};

export default ItemWithAvatar;
