pragma solidity ^0.4.19;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Words.sol";

/**
 * 留言测试类.(弃用，msg.sender原因)
 */
contract TestWords {
    TestWords words = TestWords(DeployedAddresses.TestWords()); // 获取留言类实例

    words.sendMessage("留言的内容"，"2018-6-4 10:13:36"); // 发送留言

    /**
     * 测试发送和读取留言
     */
    function testMessage() public {
    	var result = words.readRandomMessage(1);
        var real = "{"from": msg.sender, "content": result.content, "time": result.time}";
        var expected = "{"from": msg.sender, "content": "留言的内容", "time": "2018-6-4 10:13:36"}";
    	Assert.equal(real, expected, "留言测试成功！");
    }
    
}

