from brownie import Operations, YodCoin
from scripts.helpfulScripts import getAccount
from web3 import Web3

def deploy_ops():
    account = getAccount()
    deploy_tx = Operations.deploy(
        {"from": account}, publish_source=True)
    print(deploy_tx)


def deploy_token():
    account = getAccount()
    initial_supply = Web3.toWei("10000", "ether")
    deploy_tx = YodCoin.deploy(initial_supply,
        {"from": account}, publish_source=True)
    print(deploy_tx)


def main():
    deploy_ops()
    # deploy_token()