// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Counters} from "@openzeppelin/contracts/utils/Counters.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

// README
// contract Uri
// author
// natspecc

contract Graffiti is ERC721, Ownable {
    using Strings for uint256;

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    mapping(uint256 => string) private _images;

    /**
     * The token does not exist.
     */
    error URIQueryForNonexistentToken();

    constructor() public ERC721("Graffiti", "NMB-SB") {}

    function remove(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "Only the owner can remove graffiti"
        );
        _burn(tokenId);
    }

    function image(uint256 id) external view returns (string memory) {
        // Ensure that a token with the given id exists.
        if (!_exists(id)) {
            revert URIQueryForNonexistentToken();
        }

        return
            string(abi.encodePacked("data:image/svg+xml;base64,", _images[id]));
    }

    function paint(address to, string memory svg) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _images[tokenId] = Base64.encode(bytes(svg));
    }

    function tokenURI(uint256 id) public view override returns (string memory) {
        // Ensure that a token with the given id exists.
        if (!_exists(id)) {
            revert URIQueryForNonexistentToken();
        }

        // Construct and return the token metadata.
        return
            string.concat(
                "data:application/json;base64,",
                Base64.encode(
                    abi.encodePacked(
                        unicode'{"name":"NMB',
                        id.toString(),
                        // solhint-disable-next-line quotes
                        '","description":"NMB","attributes":[]',
                        // solhint-disable-next-line quotes
                        ',"image":"data:image/svg+xml;base64,',
                        _images[id],
                        // solhint-disable-next-line quotes
                        '"}'
                    )
                )
            );
    }

    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal pure override {
        require(
            from == address(0) ||
                to == address(0) ||
                firstTokenId > 0 ||
                batchSize > 0,
            "Graffiti is non-transferrable"
        );
    }
}
