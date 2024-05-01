import { useEffect, useState } from "react";
import axios from 'axios'
import { Card, List, Typography } from "antd";

function Home() {
    const [games, setGames] = useState(null);

    useEffect(() => {
        axios.get('https://localhost:7017/api/Games/bestsellers')
        .then(res => {
            setGames(res.data);
            console.log(res.data);
        })
    }, [])
  
    return (
      <></>
      // <List
      //   grid={{ gutter: 16, column: 5 }}
      //   // loading={{spinning: loading,
      //   // indicator: <LoadingOutlined style={{ fontSize: 43, position: "fixed" }} spin/>}}
      //   pagination={{ position: 'both', align: 'center', style: { marginBottom: "37px"}, defaultPageSize: 30, showSizeChanger: false}}
      //   dataSource={games}
      //   renderItem={(item) => (
      //   <List.Item>
      //     <Card title={item.name}>
      //       {/* <Typography.Paragraph>{item.product_description}</Typography.Paragraph>
      //       <Typography.Paragraph>{item.product_price}</Typography.Paragraph>
      //       <Typography.Paragraph>{item.store_name}</Typography.Paragraph>
      //       <Typography.Paragraph>{item.store_address}</Typography.Paragraph> */}
      //     </Card>
      //   </List.Item>)}>
      // </List>
    )
  }
  
export default Home